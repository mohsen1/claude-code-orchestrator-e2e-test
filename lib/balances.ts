import db from './db';

export interface Balance {
  user_id: number;
  net_balance: number;
}

export interface Transaction {
  from_user: number;
  to_user: number;
  amount: number;
}

/**
 * Calculate net balances for all users in a group
 * Returns a map of user_id -> net balance (positive means they're owed, negative means they owe)
 */
export function calculateNetBalances(groupId: number): Map<number, number> {
  const netBalances = new Map<number, number>();

  // Get all members of the group
  const members = db.prepare(`
    SELECT user_id FROM group_members WHERE group_id = ?
  `).all(groupId) as { user_id: number }[];

  // Initialize all members with 0 balance
  members.forEach(member => {
    netBalances.set(member.user_id, 0);
  });

  // Get all expenses for the group
  const expenses = db.prepare(`
    SELECT id, paid_by, amount FROM expenses WHERE group_id = ?
  `).all(groupId) as { id: number; paid_by: number; amount: number }[];

  // Process each expense
  expenses.forEach(expense => {
    // Add the amount paid to the payer's balance
    const currentBalance = netBalances.get(expense.paid_by) || 0;
    netBalances.set(expense.paid_by, currentBalance + expense.amount);

    // Get the splits for this expense
    const splits = db.prepare(`
      SELECT user_id, amount FROM expense_splits WHERE expense_id = ?
    `).all(expense.id) as { user_id: number; amount: number }[];

    // Subtract each person's share from their balance
    splits.forEach(split => {
      const balance = netBalances.get(split.user_id) || 0;
      netBalances.set(split.user_id, balance - split.amount);
    });
  });

  // Get existing settlements
  const settlements = db.prepare(`
    SELECT from_user, to_user, amount FROM settlements WHERE group_id = ?
  `).all(groupId) as { from_user: number; to_user: number; amount: number }[];

  // Account for existing settlements
  settlements.forEach(settlement => {
    const fromBalance = netBalances.get(settlement.from_user) || 0;
    const toBalance = netBalances.get(settlement.to_user) || 0;

    netBalances.set(settlement.from_user, fromBalance + settlement.amount);
    netBalances.set(settlement.to_user, toBalance - settlement.amount);
  });

  return netBalances;
}

/**
 * Simplify debts using a greedy approach
 * Matches highest debtors with highest creditors to minimize transactions
 */
export function simplifyDebts(netBalances: Map<number, number>): Transaction[] {
  const transactions: Transaction[] = [];

  // Separate into debtors (owe money) and creditors (owed money)
  const debtors: Array<{ user_id: number; amount: number }> = [];
  const creditors: Array<{ user_id: number; amount: number }> = [];

  netBalances.forEach((balance, userId) => {
    // Round to 2 decimal places to avoid floating point issues
    const roundedBalance = Math.round(balance * 100) / 100;

    if (roundedBalance < -0.01) {
      debtors.push({ user_id: userId, amount: Math.abs(roundedBalance) });
    } else if (roundedBalance > 0.01) {
      creditors.push({ user_id: userId, amount: roundedBalance });
    }
  });

  // Sort by amount (descending) - greedy approach
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Match debtors with creditors
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    // The amount to settle is the minimum of what debtor owes and creditor is owed
    const settleAmount = Math.min(debtor.amount, creditor.amount);

    // Only create transaction if amount is significant (more than 0.01)
    if (settleAmount > 0.01) {
      transactions.push({
        from_user: debtor.user_id,
        to_user: creditor.user_id,
        amount: Math.round(settleAmount * 100) / 100
      });
    }

    // Reduce the amounts
    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    // Move to next debtor or creditor if their amount is settled
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
  }

  return transactions;
}

/**
 * Calculate balances for a group
 * Returns simplified transactions to settle all debts
 */
export function calculateBalances(groupId: number): {
  netBalances: Balance[];
  simplifiedTransactions: Transaction[];
} {
  const netBalancesMap = calculateNetBalances(groupId);

  // Convert map to array
  const netBalances: Balance[] = [];
  netBalancesMap.forEach((balance, userId) => {
    const roundedBalance = Math.round(balance * 100) / 100;
    if (Math.abs(roundedBalance) > 0.01) {
      netBalances.push({
        user_id: userId,
        net_balance: roundedBalance
      });
    }
  });

  // Simplify debts
  const simplifiedTransactions = simplifyDebts(netBalancesMap);

  return {
    netBalances,
    simplifiedTransactions
  };
}
