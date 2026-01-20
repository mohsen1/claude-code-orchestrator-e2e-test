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
  return payload ? { userId: payload.userId } : null;
}

// GET /api/groups/[id]/balances - Calculate balances for a group
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

    // Get all members
    const memberIds = getGroupMembers(groupId);

    // Fetch user details for all members
    const placeholders = memberIds.map(() => '?').join(',');
    const usersStmt = db.prepare(
      `SELECT id, name FROM users WHERE id IN (${placeholders})`
    );
    const users = usersStmt.all(...memberIds) as Array<{ id: number; name: string }>;

    // Create a map of user IDs to names
    const userMap = new Map(users.map(u => [u.id, u.name]));

    // Calculate net balance for each user
    const balances = new Map<number, number>();

    // Initialize all balances to 0
    for (const userId of memberIds) {
      balances.set(userId, 0);
    }

    // Calculate what each user paid
    const paidStmt = db.prepare(`
      SELECT paid_by, SUM(amount) as total
      FROM expenses
      WHERE group_id = ?
      GROUP BY paid_by
    `);
    const paidAmounts = paidStmt.all(groupId) as Array<{ paid_by: number; total: number }>;

    for (const paid of paidAmounts) {
      const current = balances.get(paid.paid_by) || 0;
      balances.set(paid.paid_by, current + paid.total);
    }

    // Calculate what each user owes (from expense splits)
    const owesStmt = db.prepare(`
      SELECT es.user_id, SUM(es.amount) as total
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ?
      GROUP BY es.user_id
    `);
    const owedAmounts = owesStmt.all(groupId) as Array<{ user_id: number; total: number }>;

    for (const owed of owedAmounts) {
      const current = balances.get(owed.user_id) || 0;
      balances.set(owed.user_id, current - owed.total);
    }

    // Calculate settlements (simplified debt)
    const debtors: Array<{ userId: number; amount: number; name: string }> = [];
    const creditors: Array<{ userId: number; amount: number; name: string }> = [];

    for (const [userId, balance] of balances.entries()) {
      const userName = userMap.get(userId) || 'Unknown';
      if (balance < -0.01) {
        debtors.push({ userId, amount: Math.abs(balance), name: userName });
      } else if (balance > 0.01) {
        creditors.push({ userId, amount: balance, name: userName });
      }
    }

    // Sort for optimal matching
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        settlements.push({
          from_user: debtor.name,
          to_user: creditor.name,
          amount: Math.round(amount * 100) / 100
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return NextResponse.json({ balances: settlements });
  } catch (error) {
    console.error('Error calculating balances:', error);
    return NextResponse.json(
      { error: 'Failed to calculate balances' },
      { status: 500 }
    );
  }
}
