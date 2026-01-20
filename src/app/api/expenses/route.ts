import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import db from '@/lib/db';
import { CreateExpenseInput, ExpenseWithDetails } from '@/lib/schema';
import { randomUUID } from 'crypto';

// GET /api/expenses - List all expenses for groups the user is a member of
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get('group_id');

    let query = `
      SELECT e.*,
        u.name as paid_by_name,
        u.email as paid_by_email
      FROM expenses e
      INNER JOIN group_members gm ON e.group_id = gm.group_id
      INNER JOIN users u ON e.paid_by = u.id
      WHERE gm.user_id = ?
    `;
    const params: any[] = [session.user.id];

    if (groupId) {
      // Verify user is a member of the specified group
      const membership = db
        .prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?')
        .get(groupId, session.user.id);

      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this group' },
          { status: 403 }
        );
      }

      query += ' AND e.group_id = ?';
      params.push(groupId);
    }

    query += ' ORDER BY e.created_at DESC';

    const expenses = db.prepare(query).all(...params) as ExpenseWithDetails[];

    // Get splits for each expense
    for (const expense of expenses) {
      const splits = db
        .prepare(`
          SELECT es.user_id, es.amount, u.name, u.email
          FROM expense_splits es
          INNER JOIN users u ON es.user_id = u.id
          WHERE es.expense_id = ?
        `)
        .all(expense.id);

      expense.paid_by_user = {
        id: expense.paid_by,
        name: expense.paid_by_name,
        email: expense.paid_by_email,
      };
      delete (expense as any).paid_by_name;
      delete (expense as any).paid_by_email;

      expense.splits = splits.map((split: any) => ({
        user_id: split.user_id,
        amount: split.amount,
        user: {
          id: split.user_id,
          name: split.name,
          email: split.email,
        },
      }));
    }

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateExpenseInput = await request.json();
    const { group_id, description, amount, split_with } = body;

    if (!group_id || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'group_id, description, and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify user is a member of the group
    const membership = db
      .prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?')
      .get(group_id, session.user.id);

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    // Get all group members to split with
    let members = db
      .prepare(`
        SELECT user_id FROM group_members WHERE group_id = ?
      `)
      .all(group_id) as Array<{ user_id: string }>;

    // Filter by specific users if provided
    if (split_with && split_with.length > 0) {
      // Verify all users in split_with are group members
      const validUsers = new Set(members.map((m) => m.user_id));
      const invalidUsers = split_with.filter((id) => !validUsers.has(id));

      if (invalidUsers.length > 0) {
        return NextResponse.json(
          { error: 'Some users are not members of this group' },
          { status: 400 }
        );
      }

      members = members.filter((m) => split_with.includes(m.user_id));
    }

    if (members.length === 0) {
      return NextResponse.json(
        { error: 'No members to split expense with' },
        { status: 400 }
      );
    }

    const expenseId = randomUUID();
    const splitAmount = amount / members.length;

    // Create expense
    db.prepare(
      'INSERT INTO expenses (id, group_id, description, amount, paid_by) VALUES (?, ?, ?, ?, ?)'
    ).run(expenseId, group_id, description.trim(), amount, session.user.id);

    // Create expense splits
    const insertSplit = db.prepare(
      'INSERT INTO expense_splits (id, expense_id, user_id, amount) VALUES (?, ?, ?, ?)'
    );

    for (const member of members) {
      const splitId = randomUUID();
      insertSplit.run(splitId, expenseId, member.user_id, splitAmount);
    }

    // Fetch the created expense with details
    const expense = db
      .prepare(`
        SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
        FROM expenses e
        INNER JOIN users u ON e.paid_by = u.id
        WHERE e.id = ?
      `)
      .get(expenseId) as any;

    const splits = db
      .prepare(`
        SELECT es.user_id, es.amount, u.name, u.email
        FROM expense_splits es
        INNER JOIN users u ON es.user_id = u.id
        WHERE es.expense_id = ?
      `)
      .all(expenseId);

    expense.paid_by_user = {
      id: expense.paid_by,
      name: expense.paid_by_name,
      email: expense.paid_by_email,
    };
    delete expense.paid_by_name;
    delete expense.paid_by_email;

    expense.splits = splits.map((split: any) => ({
      user_id: split.user_id,
      amount: split.amount,
      user: {
        id: split.user_id,
        name: split.name,
        email: split.email,
      },
    }));

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
