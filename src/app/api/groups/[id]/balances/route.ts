import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';
import { calculateGroupBalances } from '@/lib/calculate-balances';
import { simplifyDebts } from '@/lib/simplify-debts';

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

    // Calculate balances for all members
    const balances = calculateGroupBalances(groupId);

    // Get simplified debts
    const simplifiedDebts = simplifyDebts(balances);

    // Fetch user details for the simplified debts
    const debtsWithDetails = simplifiedDebts.map((debt) => {
      const fromUser = db
        .prepare('SELECT id, name, email FROM users WHERE id = ?')
        .get(debt.from) as { id: number; name: string; email: string } | undefined;

      const toUser = db
        .prepare('SELECT id, name, email FROM users WHERE id = ?')
        .get(debt.to) as { id: number; name: string; email: string } | undefined;

      return {
        from: fromUser
          ? { id: fromUser.id, name: fromUser.name, email: fromUser.email }
          : null,
        to: toUser
          ? { id: toUser.id, name: toUser.name, email: toUser.email }
          : null,
        amount: debt.amount,
      };
    });

    // Get existing settled debts
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

    return NextResponse.json({
      balances,
      simplifiedDebts: debtsWithDetails,
      settledDebts,
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
