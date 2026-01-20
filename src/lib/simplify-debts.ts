/**
 * Simplify debts using a greedy algorithm to minimize the number of transactions.
 *
 * The algorithm works by:
 * 1. Separating users into creditors (positive balance) and debtors (negative balance)
 * 2. Sorting both groups by amount (descending for creditors, ascending for debtors)
 * 3. Matching the largest creditor with the largest debtor
 * 4. Settling the maximum possible amount between them
 * 5. Repeating until all debts are settled
 */

export interface SimplifiedDebt {
  from: number; // User ID who owes money
  to: number; // User ID who is owed money
  amount: number; // Amount to be paid
}

export interface Balance {
  userId: number;
  balance: number; // Positive = creditor, Negative = debtor
}

/**
 * Simplify debts from a list of balances.
 * Returns a minimal set of transactions to settle all debts.
 */
export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
  const simplifiedDebts: SimplifiedDebt[] = [];

  // Separate into creditors and debtors
  const creditors: Balance[] = [];
  const debtors: Balance[] = [];

  for (const balance of balances) {
    if (balance.balance > 0.01) {
      // Use small threshold to avoid floating point issues
      creditors.push({ ...balance });
    } else if (balance.balance < -0.01) {
      debtors.push({ ...balance, balance: Math.abs(balance.balance) });
    }
  }

  // Sort creditors by balance descending (largest first)
  creditors.sort((a, b) => b.balance - a.balance);

  // Sort debtors by balance descending (largest debt first)
  debtors.sort((a, b) => b.balance - a.balance);

  // Use two pointers to match creditors with debtors
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    // Calculate the amount to settle
    const amount = Math.min(creditor.balance, debtor.balance);

    if (amount > 0.01) {
      // Add the simplified debt
      simplifiedDebts.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    // Update balances
    creditor.balance -= amount;
    debtor.balance -= amount;

    // Move pointers if balances are settled
    if (creditor.balance < 0.01) {
      creditorIndex++;
    }
    if (debtor.balance < 0.01) {
      debtorIndex++;
    }
  }

  return simplifiedDebts;
}

/**
 * Calculate simplified debts for a group given the balances.
 * This is a convenience function that combines balance calculation and simplification.
 */
export function calculateSimplifiedDebts(
  balances: Array<{ userId: number; balance: number }>
): SimplifiedDebt[] {
  return simplifyDebts(balances);
}
