/**
 * Simplify debts algorithm to minimize number of transactions
 * using a greedy approach that settles the largest debts first.
 */

export interface Debt {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * Simplify a list of debts to minimize the number of transactions
 * @param balances Map of userId -> balance (positive = owed money, negative = owes money)
 * @returns Array of simplified settlements
 */
export function simplifyDebts(balances: Map<string, number>): Debt[] {
  const settlements: Debt[] = [];

  // Create array of {userId, balance} for non-zero balances
  const nonZeroBalances = Array.from(balances.entries())
    .map(([userId, balance]) => ({ userId, balance }))
    .filter((b) => Math.abs(b.balance) > 0);

  // Separate into debtors and creditors
  const debtors = nonZeroBalances
    .filter((b) => b.balance < 0)
    .map((b) => ({ userId: b.userId, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount); // Descending

  const creditors = nonZeroBalances
    .filter((b) => b.balance > 0)
    .map((b) => ({ userId: b.userId, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount); // Descending

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // Amount to settle = min(debt, credit)
    const amount = Math.min(debtor.amount, creditor.amount);

    // Round to nearest cent (handle floating point)
    const settlementAmount = Math.round(amount);

    if (settlementAmount > 0) {
      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: settlementAmount,
      });
    }

    // Update remaining amounts
    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    // Move to next debtor/creditor if settled
    if (debtor.amount < 1) {
      i++;
    }
    if (creditor.amount < 1) {
      j++;
    }
  }

  return settlements;
}

/**
 * Calculate optimal settlements for a group
 * @param expenses Array of expenses with splits
 * @returns Array of simplified settlements
 */
export function calculateSettlements(
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>
): Debt[] {
  // Calculate balances
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    // Add amount payer is owed
    const currentBalance = balances.get(expense.paidBy) || 0;
    balances.set(expense.paidBy, currentBalance + expense.amount);

    // Subtract each person's share
    for (const split of expense.splits) {
      const splitBalance = balances.get(split.userId) || 0;
      balances.set(split.userId, splitBalance - split.amount);
    }
  }

  // Simplify debts
  return simplifyDebts(balances);
}

/**
 * Validate that a set of settlements correctly settles all balances
 */
export function validateSettlements(
  balances: Map<string, number>,
  settlements: Debt[]
): boolean {
  const finalBalances = new Map(balances);

  for (const settlement of settlements) {
    const fromBalance = finalBalances.get(settlement.fromUserId) || 0;
    const toBalance = finalBalances.get(settlement.toUserId) || 0;

    finalBalances.set(settlement.fromUserId, fromBalance + settlement.amount);
    finalBalances.set(settlement.toUserId, toBalance - settlement.amount);
  }

  // All balances should be zero (or very close due to rounding)
  for (const [, balance] of finalBalances) {
    if (Math.abs(balance) > 1) {
      return false;
    }
  }

  return true;
}
