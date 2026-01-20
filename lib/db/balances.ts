import { getDb } from './schema';

export type UserBalance = {
  user_id: string;
  user_name: string;
  user_email: string;
  total_paid: number;
  total_owed: number;
  balance: number; // positive = owed money, negative = owes money
};

export type Debt = {
  from_user_id: string;
  from_user_name: string;
  from_user_email: string;
  to_user_id: string;
  to_user_name: string;
  to_user_email: string;
  amount: number;
};

/**
 * Calculate balances for all members of a group
 * Returns the net balance for each user (positive = they are owed money, negative = they owe money)
 */
export function calculateBalances(groupId: string): UserBalance[] {
  const db = getDb();

  // Get all group members
  const members = db.prepare(`
    SELECT u.id, u.name, u.email
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
  `).all(groupId) as Array<{ id: string; name: string; email: string }>;

  const balances: UserBalance[] = members.map(member => {
    // Get total amount paid by this user
    const paidResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE group_id = ? AND paid_by = ?
    `).get(groupId, member.id) as { total: number };

    const totalPaid = paidResult.total;

    // Get total amount this user owes (their share of expenses)
    const owedResult = db.prepare(`
      SELECT COALESCE(SUM(es.amount), 0) as total
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? AND es.user_id = ?
    `).get(groupId, member.id) as { total: number };

    const totalOwed = owedResult.total;

    // Balance: positive means they are owed money, negative means they owe money
    const balance = totalPaid - totalOwed;

    return {
      user_id: member.id,
      user_name: member.name,
      user_email: member.email,
      total_paid: Math.round(totalPaid * 100) / 100,
      total_owed: Math.round(totalOwed * 100) / 100,
      balance: Math.round(balance * 100) / 100
    };
  });

  return balances;
}

/**
 * Calculate simplified debts to minimize the number of transactions
 * Uses a greedy algorithm to match debtors with creditors
 */
export function getSimplifiedDebts(groupId: string): Debt[] {
  const balances = calculateBalances(groupId);

  // Separate into debtors (negative balance) and creditors (positive balance)
  const debtors: Array<{ user_id: string; user_name: string; user_email: string; amount: number }> = [];
  const creditors: Array<{ user_id: string; user_name: string; user_email: string; amount: number }> = [];

  for (const balance of balances) {
    if (balance.balance < -0.01) {
      // User owes money (debtor)
      debtors.push({
        user_id: balance.user_id,
        user_name: balance.user_name,
        user_email: balance.user_email,
        amount: Math.abs(balance.balance)
      });
    } else if (balance.balance > 0.01) {
      // User is owed money (creditor)
      creditors.push({
        user_id: balance.user_id,
        user_name: balance.user_name,
        user_email: balance.user_email,
        amount: balance.balance
      });
    }
  }

  // Calculate optimal settlements using greedy algorithm
  const debts: Debt[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    // Determine the amount to settle (minimum of what debtor owes and what creditor is owed)
    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0.01) {
      debts.push({
        from_user_id: debtor.user_id,
        from_user_name: debtor.user_name,
        from_user_email: debtor.user_email,
        to_user_id: creditor.user_id,
        to_user_name: creditor.user_name,
        to_user_email: creditor.user_email,
        amount: Math.round(settleAmount * 100) / 100
      });
    }

    // Reduce the amounts
    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    // Move to next debtor if current one is settled
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }

    // Move to next creditor if current one is fully paid
    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
  }

  return debts;
}

/**
 * Get balance for a specific user in a group
 */
export function getUserBalance(groupId: string, userId: string): UserBalance | null {
  const balances = calculateBalances(groupId);
  return balances.find(b => b.user_id === userId) || null;
}

/**
 * Calculate how much one user owes another user in a group
 */
export function getDebtBetweenUsers(
  groupId: string,
  fromUserId: string,
  toUserId: string
): number {
  const debts = getSimplifiedDebts(groupId);

  const debt = debts.find(
    d => d.from_user_id === fromUserId && d.to_user_id === toUserId
  );

  return debt ? debt.amount : 0;
}

/**
 * Record a settlement between users
 */
export function createSettlement(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number
): string {
  const db = getDb();

  const settlementId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  db.prepare(`
    INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, settled_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    settlementId,
    groupId,
    fromUserId,
    toUserId,
    amount,
    new Date().toISOString()
  );

  return settlementId;
}

/**
 * Get all settlements for a group
 */
export function getGroupSettlements(groupId: string) {
  const db = getDb();

  const settlements = db.prepare(`
    SELECT
      s.*,
      from_user.name as from_user_name,
      from_user.email as from_user_email,
      to_user.name as to_user_name,
      to_user.email as to_user_email
    FROM settlements s
    JOIN users from_user ON s.from_user_id = from_user.id
    JOIN users to_user ON s.to_user_id = to_user.id
    WHERE s.group_id = ?
    ORDER BY s.settled_at DESC
  `).all(groupId);

  return settlements;
}

/**
 * Get total amount owed to a user (positive balance)
 */
export function getUserTotalOwedToThem(groupId: string, userId: string): number {
  const balance = getUserBalance(groupId, userId);
  if (!balance || balance.balance < 0) {
    return 0;
  }
  return balance.balance;
}

/**
 * Get total amount a user owes (negative balance)
 */
export function getUserTotalOwe(groupId: string, userId: string): number {
  const balance = getUserBalance(groupId, userId);
  if (!balance || balance.balance > 0) {
    return 0;
  }
  return Math.abs(balance.balance);
}

/**
 * Check if a group is settled up (no outstanding debts)
 */
export function isGroupSettled(groupId: string): boolean {
  const debts = getSimplifiedDebts(groupId);
  return debts.length === 0;
}
