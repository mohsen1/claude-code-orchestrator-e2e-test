import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isGroupMember } from '@/lib/db-groups';
import { verifyJWT } from '@/lib/auth';
import db from '@/lib/db';

// Helper function to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyJWT(token);
  return payload ? { userId: payload.userId } : null;
}

// GET /api/groups/[id]/expenses - Get all expenses for a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    // Check if user is a member
    if (!isGroupMember(groupId, user.userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Not a member of this group' },
        { status: 403 }
      );
    }

    // Fetch expenses with payer information
    const stmt = db.prepare(`
      SELECT
        e.id,
        e.description,
        e.amount,
        e.created_at as date,
        u.name as paid_by
      FROM expenses e
      JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ?
      ORDER BY e.created_at DESC
    `);

    const expenses = stmt.all(groupId);

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[id]/expenses - Add a new expense to a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    // Check if user is a member
    if (!isGroupMember(groupId, user.userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Not a member of this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { description, amount } = body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Start a transaction
    const insertExpense = db.prepare(`
      INSERT INTO expenses (group_id, paid_by, amount, description)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertExpense.run(groupId, user.userId, amount, description.trim());
    const expenseId = result.lastInsertRowid;

    // Get all group members for equal split
    const membersStmt = db.prepare(`
      SELECT user_id FROM group_members WHERE group_id = ?
    `);
    const members = membersStmt.all(groupId) as Array<{ user_id: number }>;

    if (members.length === 0) {
      return NextResponse.json(
        { error: 'No members in group' },
        { status: 400 }
      );
    }

    // Calculate equal split
    const splitAmount = amount / members.length;

    // Insert expense splits
    const insertSplit = db.prepare(`
      INSERT INTO expense_splits (expense_id, user_id, amount)
      VALUES (?, ?, ?)
    `);

    for (const member of members) {
      insertSplit.run(expenseId, member.user_id, splitAmount);
    }

    // Fetch the created expense
    const expenseStmt = db.prepare(`
      SELECT
        e.id,
        e.description,
        e.amount,
        e.created_at as date,
        u.name as paid_by
      FROM expenses e
      JOIN users u ON e.paid_by = u.id
      WHERE e.id = ?
    `);
    const expense = expenseStmt.get(expenseId);

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
