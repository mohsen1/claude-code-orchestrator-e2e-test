/**
 * Represents a simplified debt between two users
 * For example: User A owes User B $50
 */
export interface Debt {
  owes: string; // User ID who owes money
  owedTo: string; // User ID who is owed money
  amount: number; // Amount in cents
}

/**
 * Represents a balance for a user
 * Positive: User is owed money
 * Negative: User owes money
 */
interface Balance {
  userId: string;
  amount: number; // Amount in cents
}

/**
 * Simplify debts using a greedy algorithm to minimize the number of transactions
 *
 * This is the classic "minimum cash flow" problem. The algorithm:
 * 1. Calculate net balance for each person (amount they've paid - amount they owe)
 * 2. Repeatedly match the person with the maximum credit (owed money) with the person
 *    with maximum debit (owes money)
 * 3. Settle the minimum of these two amounts
 * 4. Repeat until all balances are zero
 *
 * @param balances - Map of user IDs to their net balance (can be positive or negative)
 * @returns Array of simplified debts
 */
export function simplifyDebts(balances: Map<string, number>): Debt[] {
  const debts: Debt[] = [];

  // Convert to array and filter out zero balances
  const balanceArray: Balance[] = Array.from(balances.entries())
    .map(([userId, amount]) => ({ userId, amount }))
    .filter((balance) => balance.amount !== 0);

  // While there are still non-zero balances
  while (balanceArray.length > 0) {
    // Find person with maximum credit (positive balance)
    let maxCreditIndex = 0;
    let maxDebitIndex = 0;

    for (let i = 1; i < balanceArray.length; i++) {
      if (balanceArray[i].amount > balanceArray[maxCreditIndex].amount) {
        maxCreditIndex = i;
      }
      if (balanceArray[i].amount < balanceArray[maxDebitIndex].amount) {
        maxDebitIndex = i;
      }
    }

    const maxCredit = balanceArray[maxCreditIndex];
    const maxDebit = balanceArray[maxDebitIndex];

    // The amount to settle is the minimum of the absolute values
    const settlementAmount = Math.min(
      Math.abs(maxCredit.amount),
      Math.abs(maxDebit.amount)
    );

    // Add a debt from the person who owes to the person who is owed
    if (settlementAmount > 0) {
      debts.push({
        owes: maxDebit.userId,
        owedTo: maxCredit.userId,
        amount: settlementAmount,
      });
    }

    // Update the balances
    maxCredit.amount -= settlementAmount;
    maxDebit.amount += settlementAmount;

    // Remove users with zero balance
    if (Math.abs(maxCredit.amount) < 1) { // Account for floating point errors
      balanceArray.splice(maxCreditIndex, 1);
    }
    if (Math.abs(maxDebit.amount) < 1) {
      balanceArray.splice(
        maxDebitIndex > maxCreditIndex ? maxDebitIndex - 1 : maxDebitIndex,
        1
      );
    }
  }

  return debts;
}

/**
 * Calculate net balances for all users in a group
 *
 * @param expenses - Array of expenses with amounts and payers
 * @param userIds - Array of all user IDs in the group
 * @returns Map of user IDs to their net balance
 */
export function calculateBalances(
  expenses: Array<{
    amount: number;
    paidById: string;
    splitType: "EQUAL";
    involvedUserIds: string[];
  }>,
  userIds: string[]
): Map<string, number> {
  const balances = new Map<string, number>();

  // Initialize all balances to 0
  for (const userId of userIds) {
    balances.set(userId, 0);
  }

  // Process each expense
  for (const expense of expenses) {
    const { amount, paidById, involvedUserIds } = expense;
    const splitAmount = Math.floor(amount / involvedUserIds.length);

    // The payer gets credit for the full amount
    const currentBalance = balances.get(paidById) || 0;
    balances.set(paidById, currentBalance + amount);

    // Each involved person owes their split
    for (const userId of involvedUserIds) {
      const userBalance = balances.get(userId) || 0;
      balances.set(userId, userBalance - splitAmount);
    }
  }

  return balances;
}

/**
 * Calculate the optimal settlements for a group
 *
 * @param expenses - Array of expenses with amounts and payers
 * @param userIds - Array of all user IDs in the group
 * @returns Array of simplified debts representing optimal settlements
 */
export function calculateSettlements(
  expenses: Array<{
    amount: number;
    paidById: string;
    splitType: "EQUAL";
    involvedUserIds: string[];
  }>,
  userIds: string[]
): Debt[] {
  const balances = calculateBalances(expenses, userIds);
  return simplifyDebts(balances);
}

/**
 * Get the total amount a specific user owes or is owed
 *
 * @param userId - The user ID to check
 * @param debts - Array of simplified debts
 * @returns Object with amount owed and amount to receive (in cents)
 */
export function getUserDebtSummary(userId: string, debts: Debt[]): {
  owes: number;
  owed: number;
} {
  let owes = 0;
  let owed = 0;

  for (const debt of debts) {
    if (debt.owes === userId) {
      owes += debt.amount;
    } else if (debt.owedTo === userId) {
      owed += debt.amount;
    }
  }

  return { owes, owed };
}
