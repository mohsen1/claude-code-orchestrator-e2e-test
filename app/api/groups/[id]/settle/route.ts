import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isGroupMember, getGroupMembers } from '@/lib/db-groups';
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
  if (!payload) {
    return null;
  }

  // Fetch user details from database
  const userStmt = db.prepare('SELECT id, name FROM users WHERE id = ?');
  const user = userStmt.get(payload.userId) as { id: number; name: string } | undefined;

  return user ? { userId: user.id, userName: user.name } : null;
}

// POST /api/groups/[id]/settle - Settle a debt between users
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
    const { from_user, to_user, amount } = body;

    if (!from_user || !to_user || !amount) {
      return NextResponse.json(
        { error: 'from_user, to_user, and amount are required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Get user IDs from names
    const userStmt = db.prepare('SELECT id FROM users WHERE name = ?');
    const fromUserRow = userStmt.get(from_user) as { id: number } | undefined;
    const toUserRow = userStmt.get(to_user) as { id: number } | undefined;

    if (!fromUserRow || !toUserRow) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify that the current user is involved in the settlement
    if (user.userId !== fromUserRow.id && user.userId !== toUserRow.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only settle debts involving yourself' },
        { status: 403 }
      );
    }

    // Record the settlement
    const insertStmt = db.prepare(`
      INSERT INTO settlements (group_id, from_user, to_user, amount)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertStmt.run(groupId, fromUserRow.id, toUserRow.id, amount);

    if (!result.lastInsertRowid) {
      return NextResponse.json(
        { error: 'Failed to record settlement' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Debt settled successfully',
      settlement: {
        from_user,
        to_user,
        amount
      }
    });
  } catch (error) {
    console.error('Error settling debt:', error);
    return NextResponse.json(
      { error: 'Failed to settle debt' },
      { status: 500 }
    );
  }
}
