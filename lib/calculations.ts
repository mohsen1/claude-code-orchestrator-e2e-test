// Types for expense calculations
export interface Expense {
  id: string;
  amount: number;
  payerId: string;
  group_id: string;
  description?: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
}

export interface UserBalance {
  userId: string;
  balance: number;
  // Positive balance means they are owed money
  // Negative balance means they owe money
}

export interface Settlement {
  from: string; // userId who owes money
  to: string; // userId who is owed money
  amount: number;
}

export interface GroupBalances {
  balances: UserBalance[];
  settlements: Settlement[];
}

/**
 * Calculate equal split for an expense among group members
 * @param amount - Total expense amount
 * @param memberIds - Array of member user IDs to split between
 * @returns Map of userId to their share amount
 */
export function calculateEqualSplit(
  amount: number,
  memberIds: string[]
): Map<string, number> {
  const shares = new Map<string, number>();

  if (memberIds.length === 0) {
    return shares;
  }

  const shareAmount = amount / memberIds.length;

  for (const memberId of memberIds) {
    shares.set(memberId, shareAmount);
  }

  return shares;
}

/**
 * Calculate balances for all users in a group based on expenses
 * @param expenses - Array of expenses in the group
 * @param memberIds - Array of all member user IDs in the group
 * @returns Array of user balances
 */
export function calculateGroupBalances(
  expenses: Expense[],
  memberIds: string[]
): UserBalance[] {
  // Initialize balances for all members
  const balanceMap = new Map<string, number>();

  for (const memberId of memberIds) {
    balanceMap.set(memberId, 0);
  }

  // Process each expense
  for (const expense of expenses) {
    const { amount, payerId } = expense;

    // Payer paid the full amount (positive balance)
    const currentPayerBalance = balanceMap.get(payerId) || 0;
    balanceMap.set(payerId, currentPayerBalance + amount);

    // Split the expense equally among all current members
    // Note: In a real app, you might want to store which members were part of each expense
    // For now, we'll split among all current group members
    const splitAmount = amount / memberIds.length;

    for (const memberId of memberIds) {
      const currentBalance = balanceMap.get(memberId) || 0;
      balanceMap.set(memberId, currentBalance - splitAmount);
    }
  }

  // Convert map to array
  const balances: UserBalance[] = [];
  for (const [userId, balance] of balanceMap.entries()) {
    balances.push({ userId, balance });
  }

  return balances;
}

/**
 * Calculate optimal settlements to minimize transactions
 * Uses a greedy algorithm to match debtors with creditors
 * @param balances - Array of user balances
 * @returns Array of settlements (who pays whom and how much)
 */
export function calculateSettlements(balances: UserBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors: UserBalance[] = [];
  const debtors: UserBalance[] = [];

  for (const balance of balances) {
    if (balance.balance > 0.01) {
      // Account for floating point precision
      creditors.push({ ...balance });
    } else if (balance.balance < -0.01) {
      debtors.push({ ...balance, balance: -balance.balance });
    }
  }

  // Sort by amount (descending) for optimal matching
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  // Match debtors with creditors
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0.01) {
      // Account for floating point precision
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    // Update remaining amounts
    debtor.balance -= amount;
    creditor.balance -= amount;

    // Move to next if settled
    if (debtor.balance < 0.01) {
      debtorIdx++;
    }
    if (creditor.balance < 0.01) {
      creditorIdx++;
    }
  }

  return settlements;
}

/**
 * Calculate complete group financials including settlements
 * @param expenses - Array of expenses in the group
 * @param memberIds - Array of all member user IDs in the group
 * @returns Object with balances and settlements
 */
export function calculateGroupFinancials(
  expenses: Expense[],
  memberIds: string[]
): GroupBalances {
  const balances = calculateGroupBalances(expenses, memberIds);
  const settlements = calculateSettlements(balances);

  return {
    balances,
    settlements,
  };
}

/**
 * Get a simplified summary of what a specific user owes or is owed
 * @param userId - The user ID to get summary for
 * @param balances - Array of user balances
 * @returns Object with total owed, total to receive, and net balance
 */
export function getUserBalanceSummary(
  userId: string,
  balances: UserBalance[]
): {
  totalOwed: number;
  totalToReceive: number;
  netBalance: number;
} {
  const userBalance = balances.find((b) => b.userId === userId);

  if (!userBalance) {
    return {
      totalOwed: 0,
      totalToReceive: 0,
      netBalance: 0,
    };
  }

  const netBalance = userBalance.balance;

  return {
    totalOwed: netBalance < 0 ? Math.round(-netBalance * 100) / 100 : 0,
    totalToReceive: netBalance > 0 ? Math.round(netBalance * 100) / 100 : 0,
    netBalance: Math.round(netBalance * 100) / 100,
  };
}

/**
 * Calculate individual user's settlement list
 * Shows who they need to pay and who needs to pay them
 * @param userId - The user ID to get settlements for
 * @param settlements - Array of all settlements in the group
 * @returns Object with payments to make and payments to receive
 */
export function getUserSettlements(
  userId: string,
  settlements: Settlement[]
): {
  toPay: Settlement[];
  toReceive: Settlement[];
} {
  const toPay: Settlement[] = [];
  const toReceive: Settlement[] = [];

  for (const settlement of settlements) {
    if (settlement.from === userId) {
      toPay.push(settlement);
    } else if (settlement.to === userId) {
      toReceive.push(settlement);
    }
  }

  return {
    toPay,
    toReceive,
  };
}

/**
 * Validate if amounts are properly split
 * @param amount - Total expense amount
 * @param shares - Map of userId to their share
 * @returns Boolean indicating if shares add up to total
 */
export function validateShares(
  amount: number,
  shares: Map<string, number>
): boolean {
  let total = 0;

  for (const share of shares.values()) {
    total += share;
  }

  // Account for floating point precision
  return Math.abs(total - amount) < 0.01;
}

/**
 * Format currency amount for display
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
