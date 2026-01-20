import db from '@/lib/db';

export interface Balance {
  userId: number;
  userName: string;
  userEmail: string;
  balance: number; // Positive = they are owed money, Negative = they owe money
}

/**
 * Calculate the net balance for each user in a group.
 * A positive balance means the user is owed money (they paid more than their share).
 * A negative balance means the user owes money (they paid less than their share).
 */
export function calculateGroupBalances(groupId: number): Balance[] {
  // Get all group members
  const members = db
    .prepare(
      `
      SELECT u.id, u.name, u.email
      FROM users u
      INNER JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
    `
    )
    .all(groupId) as Array<{ id: number; name: string; email: string }>;

  if (members.length === 0) {
    return [];
  }

  // Calculate total paid by each user
  const paidByUser = db
    .prepare(
      `
      SELECT paid_by as user_id, SUM(amount) as total_paid
      FROM expenses
      WHERE group_id = ?
      GROUP BY paid_by
    `
    )
    .all(groupId) as Array<{ user_id: number; total_paid: number }>;

  // Create a map of payments
  const payments = new Map<number, number>();
  paidByUser.forEach((row) => {
    payments.set(row.user_id, row.total_paid);
  });

  // Calculate total share for each user (from expense_splits)
  const shareByUser = db
    .prepare(
      `
      SELECT es.user_id, SUM(es.amount) as total_share
      FROM expense_splits es
      INNER JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ?
      GROUP BY es.user_id
    `
    )
    .all(groupId) as Array<{ user_id: number; total_share: number }>;

  // Create a map of shares
  const shares = new Map<number, number>();
  shareByUser.forEach((row) => {
    shares.set(row.user_id, row.total_share);
  });

  // Calculate net balance for each member
  const balances: Balance[] = members.map((member) => {
    const paid = payments.get(member.id) || 0;
    const share = shares.get(member.id) || 0;
    const balance = paid - share;

    return {
      userId: member.id,
      userName: member.name,
      userEmail: member.email,
      balance,
    };
  });

  return balances;
}
