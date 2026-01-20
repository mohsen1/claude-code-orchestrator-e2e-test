import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    const body = await request.json();
    const { fromUserId, toUserId, amount } = body;

    // Validate input
    if (!fromUserId || !toUserId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Check if the current user is either the payer or the receiver
    if (payload.userId !== fromUserId && payload.userId !== toUserId) {
      return NextResponse.json(
        { error: 'You can only settle your own debts' },
        { status: 403 }
      );
    }

    // Check if both users are members of the group
    const members = db
      .prepare(
        'SELECT user_id FROM group_members WHERE group_id = ? AND user_id IN (?, ?)'
      )
      .all(groupId, fromUserId, toUserId);

    if (members.length !== 2) {
      return NextResponse.json(
        { error: 'Both users must be members of the group' },
        { status: 400 }
      );
    }

    // Check if a debt record already exists
    const existingDebt = db
      .prepare(
        'SELECT id, amount FROM debts WHERE group_id = ? AND from_user_id = ? AND to_user_id = ?'
      )
      .get(groupId, fromUserId, toUserId) as { id: number; amount: number } | undefined;

    if (existingDebt) {
      // Update existing debt
      const newAmount = existingDebt.amount + amount;
      db.prepare(
        'UPDATE debts SET amount = ?, settled = 1 WHERE id = ?'
      ).run(newAmount, existingDebt.id);
    } else {
      // Insert new debt record
      db.prepare(
        `
        INSERT INTO debts (group_id, from_user_id, to_user_id, amount, settled)
        VALUES (?, ?, ?, ?, 1)
      `
      ).run(groupId, fromUserId, toUserId, amount);
    }

    // Fetch the created/updated debt record with user details
    const debt = db
      .prepare(
        `
        SELECT
          d.id,
          d.from_user_id,
          d.to_user_id,
          d.amount,
          u1.name as from_user_name,
          u1.email as from_user_email,
          u2.name as to_user_name,
          u2.email as to_user_email,
          d.settled,
          d.created_at
        FROM debts d
        INNER JOIN users u1 ON d.from_user_id = u1.id
        INNER JOIN users u2 ON d.to_user_id = u2.id
        WHERE d.group_id = ? AND d.from_user_id = ? AND d.to_user_id = ?
      `
      )
      .get(groupId, fromUserId, toUserId) as {
        id: number;
        from_user_id: number;
        to_user_id: number;
        amount: number;
        from_user_name: string;
        from_user_email: string;
        to_user_name: string;
        to_user_email: string;
        settled: number;
        created_at: string;
      };

    return NextResponse.json(
      {
        message: 'Debt marked as settled',
        debt: {
          id: debt.id,
          from: {
            id: debt.from_user_id,
            name: debt.from_user_name,
            email: debt.from_user_email,
          },
          to: {
            id: debt.to_user_id,
            name: debt.to_user_name,
            email: debt.to_user_email,
          },
          amount: debt.amount,
          settled: Boolean(debt.settled),
          createdAt: debt.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error settling debt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve all settled debts for a group
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = parseInt(params.id);

    // Check if user is a member of the group
    const member = db
      .prepare(
        'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?'
      )
      .get(groupId, payload.userId);

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    // Get all settled debts for the group
    const settledDebts = db
      .prepare(
        `
        SELECT
          d.id,
          d.from_user_id,
          d.to_user_id,
          d.amount,
          u1.name as from_user_name,
          u1.email as from_user_email,
          u2.name as to_user_name,
          u2.email as to_user_email,
          d.created_at
        FROM debts d
        INNER JOIN users u1 ON d.from_user_id = u1.id
        INNER JOIN users u2 ON d.to_user_id = u2.id
        WHERE d.group_id = ? AND d.settled = 1
        ORDER BY d.created_at DESC
      `
      )
      .all(groupId);

    const formattedDebts = settledDebts.map((debt: any) => ({
      id: debt.id,
      from: {
        id: debt.from_user_id,
        name: debt.from_user_name,
        email: debt.from_user_email,
      },
      to: {
        id: debt.to_user_id,
        name: debt.to_user_name,
        email: debt.to_user_email,
      },
      amount: debt.amount,
      settled: true,
      createdAt: debt.created_at,
    }));

    return NextResponse.json({ settledDebts: formattedDebts });
  } catch (error) {
    console.error('Error fetching settled debts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
