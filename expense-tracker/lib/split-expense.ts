/**
 * Equal splitting logic for expenses
 */

export interface Split {
  userId: number;
  amount: number;
}

/**
 * Split an expense equally among all group members
 * @param totalAmount - The total expense amount
 * @param memberIds - Array of user IDs who should split the expense
 * @returns Array of splits with user IDs and their equal shares
 */
export function splitExpenseEqually(totalAmount: number, memberIds: number[]): Split[] {
  if (memberIds.length === 0) {
    throw new Error('Cannot split expense: No members provided');
  }

  if (totalAmount <= 0) {
    throw new Error('Amount must be positive');
  }

  // Calculate the equal share amount
  const equalShare = totalAmount / memberIds.length;

  // Handle floating point precision by rounding to 2 decimal places
  const roundedShare = Math.round(equalShare * 100) / 100;

  // Create splits for all members
  const splits: Split[] = memberIds.map((userId) => ({
    userId,
    amount: roundedShare
  }));

  // Adjust for rounding errors
  // The sum of rounded shares might not equal the total amount
  // We add/subtract the difference to/from the first person's share
  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
  const difference = Math.round((totalAmount - totalSplit) * 100) / 100;

  if (difference !== 0 && splits.length > 0) {
    splits[0].amount = Math.round((splits[0].amount + difference) * 100) / 100;
  }

  return splits;
}

/**
 * Calculate simplified debts to minimize transactions
 * This uses a net balance approach to determine who should pay whom
 * @param balances - Object mapping user IDs to their net balance (positive = owed money, negative = owes money)
 * @returns Array of simplified payment transactions
 */
export interface DebtTransaction {
  from: number; // User ID who owes money
  to: number; // User ID who should receive money
  amount: number;
}

export function simplifyDebts(balances: Map<number, number>): DebtTransaction[] {
  const transactions: DebtTransaction[] = [];

  // Separate debtors and creditors
  const debtors: Array<{ userId: number; amount: number }> = [];
  const creditors: Array<{ userId: number; amount: number }> = [];

  for (const [userId, balance] of balances.entries()) {
    if (balance < -0.01) {
      // User owes money (negative balance)
      debtors.push({ userId, amount: -balance });
    } else if (balance > 0.01) {
      // User is owed money (positive balance)
      creditors.push({ userId, amount: balance });
    }
  }

  // Sort by amount descending for optimal matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Match debtors with creditors
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // The amount to transfer is the minimum of what debtor owes and creditor is owed
    const amount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0.01) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: roundedAmount
      });
    }

    // Update remaining amounts
    debtor.amount -= amount;
    creditor.amount -= amount;

    // Move to next debtor or creditor if their amount is settled
    if (debtor.amount < 0.01) {
      i++;
    }
    if (creditor.amount < 0.01) {
      j++;
    }
  }

  return transactions;
}

/**
 * Calculate net balances for all members in a group
 * based on their expenses and payments
 * @param expenses - Array of expenses with splits
 * @param memberIds - All member IDs in the group
 * @returns Map of user ID to net balance (positive = they should receive money, negative = they owe money)
 */
export interface ExpenseWithSplits {
  paid_by: number;
  amount: number;
  splits: Array<{ user_id: number; amount: number }>;
}

export function calculateNetBalances(
  expenses: ExpenseWithSplits[],
  memberIds: number[]
): Map<number, number> {
  const balances = new Map<number, number>();

  // Initialize all members with 0 balance
  for (const userId of memberIds) {
    balances.set(userId, 0);
  }

  // Process each expense
  for (const expense of expenses) {
    const payer = expense.paid_by;
    const totalAmount = expense.amount;

    // Payer paid the full amount, so they are owed that amount
    const currentPayerBalance = balances.get(payer) || 0;
    balances.set(payer, currentPayerBalance + totalAmount);

    // Each person who split the expense owes their share
    for (const split of expense.splits) {
      const splitUser = split.user_id;
      const splitAmount = split.amount;

      const currentBalance = balances.get(splitUser) || 0;
      balances.set(splitUser, currentBalance - splitAmount);
    }
  }

  // Round all balances to 2 decimal places
  for (const [userId, balance] of balances.entries()) {
    balances.set(userId, Math.round(balance * 100) / 100);
  }

  return balances;
}

/**
 * Format a balance for display
 * @param balance - The net balance (positive = owed, negative = owes)
 * @returns Formatted string
 */
export function formatBalance(balance: number): string {
  const rounded = Math.round(balance * 100) / 100;
  if (rounded > 0) {
    return `owed $${rounded.toFixed(2)}`;
  } else if (rounded < 0) {
    return `owes $${Math.abs(rounded).toFixed(2)}`;
  } else {
    return 'settled up';
  }
}
