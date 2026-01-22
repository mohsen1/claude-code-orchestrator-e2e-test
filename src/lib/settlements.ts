/**
 * Settlement calculation utilities
 * Implements debt graph simplification algorithm to minimize number of transactions
 */

import type { DebtEdge, UserBalance } from '@/types';

/**
 * Settlement graph node representing a user's balance
 */
interface SettlementNode {
  userId: string;
  balance: number; // in cents, positive = owed to, negative = owes
}

/**
 * Calculate optimal settlement paths from expense balances
 * Uses a greedy algorithm to minimize the number of transactions
 *
 * @param balances - Array of user balances
 * @returns Array of optimal settlement edges
 *
 * @example
 * const balances = [
 *   { userId: '1', balance: 5000 },    // owed $50
 *   { userId: '2', balance: -3000 },   // owes $30
 *   { userId: '3', balance: -2000 }    // owes $20
 * ];
 * calculateSettlements(balances);
 * // Returns: [
 * //   { from: '2', to: '1', amount: 3000 },
 * //   { from: '3', to: '1', amount: 2000 }
 * // ]
 */
export function calculateSettlements(balances: UserBalance[]): DebtEdge[] {
  // Filter out users with zero balance
  const activeBalances = balances.filter(b => b.balance !== 0);

  if (activeBalances.length === 0) {
    return [];
  }

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors: SettlementNode[] = activeBalances
    .filter(b => b.balance > 0)
    .map(b => ({ userId: b.userId, balance: b.balance }))
    .sort((a, b) => b.balance - a.balance); // Sort descending

  const debtors: SettlementNode[] = activeBalances
    .filter(b => b.balance < 0)
    .map(b => ({ userId: b.userId, balance: -b.balance })) // Convert to positive amount
    .sort((a, b) => b.balance - a.balance); // Sort descending

  const settlements: DebtEdge[] = [];
  let creditorIdx = 0;
  let debtorIdx = 0;

  // Greedy algorithm: match largest debts with largest credits
  while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
    const creditor = creditors[creditorIdx];
    const debtor = debtors[debtorIdx];

    // Calculate settlement amount (minimum of remaining debt and credit)
    const amount = Math.min(creditor.balance, debtor.balance);

    if (amount > 0) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount,
      });

      // Update remaining balances
      creditor.balance -= amount;
      debtor.balance -= amount;
    }

    // Move to next creditor if their balance is settled
    if (creditor.balance === 0) {
      creditorIdx++;
    }

    // Move to next debtor if their debt is settled
    if (debtor.balance === 0) {
      debtorIdx++;
    }
  }

  return settlements;
}

/**
 * Calculate user balances from expenses and settlements
 *
 * @param expenses - Array of expenses with splits
 * @param existingSettlements - Array of completed settlements
 * @returns Array of user balances
 */
export function calculateBalances(
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>,
  existingSettlements: Array<{
    fromUserId: string;
    toUserId: string;
    amount: number;
    status: string;
  }>
): UserBalance[] {
  const balanceMap = new Map<string, number>();

  // Process expenses
  for (const expense of expenses) {
    // Payer is owed the full expense amount
    const payerBalance = balanceMap.get(expense.paidBy) || 0;
    balanceMap.set(expense.paidBy, payerBalance + expense.amount);

    // Each split member owes their share
    for (const split of expense.splits) {
      const memberBalance = balanceMap.get(split.userId) || 0;
      balanceMap.set(split.userId, memberBalance - split.amount);
    }
  }

  // Apply completed settlements
  for (const settlement of existingSettlements) {
    if (settlement.status === 'COMPLETED') {
      // Payer's debt is reduced
      const fromBalance = balanceMap.get(settlement.fromUserId) || 0;
      balanceMap.set(settlement.fromUserId, fromBalance + settlement.amount);

      // Payee's credit is reduced
      const toBalance = balanceMap.get(settlement.toUserId) || 0;
      balanceMap.set(settlement.toUserId, toBalance - settlement.amount);
    }
  }

  // Convert map to array
  return Array.from(balanceMap.entries()).map(([userId, balance]) => ({
    userId,
    userName: '', // Will be populated from database
    userImage: null,
    balance,
    totalOwed: balance > 0 ? balance : 0,
    totalOwing: balance < 0 ? -balance : 0,
    lastActivity: null,
  }));
}

/**
 * Validate settlement amounts match total debts
 * Ensures no money is lost or created in settlement calculation
 *
 * @param settlements - Array of settlement edges
 * @param balances - Original user balances
 * @returns True if settlements are valid
 */
export function validateSettlements(
  settlements: DebtEdge[],
  balances: UserBalance[]
): boolean {
  // Calculate total owed to creditors (positive balances)
  const totalOwed = balances.filter(b => b.balance > 0).reduce((sum, b) => sum + b.balance, 0);

  // Calculate total settlement amount
  const totalSettlements = settlements.reduce((sum, s) => sum + s.amount, 0);

  // They should match (accounting for rounding differences)
  return Math.abs(totalOwed - totalSettlements) <= 1; // Allow 1 cent rounding difference
}

/**
 * Format settlement description
 *
 * @param settlement - Settlement edge
 * @param fromUserName - Payer name
 * @param toUserName - Payee name
 * @returns Human-readable description
 */
export function formatSettlementDescription(
  settlement: DebtEdge,
  fromUserName: string,
  toUserName: string
): string {
  const amount = settlement.amount / 100;
  return `${fromUserName} owes ${toUserName} $${amount.toFixed(2)}`;
}

/**
 * Calculate statistics about settlement complexity
 *
 * @param settlements - Array of settlement edges
 * @returns Statistics object
 */
export function calculateSettlementStats(settlements: DebtEdge[]): {
  transactionCount: number;
  totalAmount: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
} {
  if (settlements.length === 0) {
    return {
      transactionCount: 0,
      totalAmount: 0,
      averageAmount: 0,
      maxAmount: 0,
      minAmount: 0,
    };
  }

  const amounts = settlements.map(s => s.amount);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);

  return {
    transactionCount: settlements.length,
    totalAmount,
    averageAmount: Math.round(totalAmount / settlements.length),
    maxAmount: Math.max(...amounts),
    minAmount: Math.min(...amounts),
  };
}

/**
 * Suggest settlement order to minimize transaction rounds
 * Orders settlements to allow parallel payments where possible
 *
 * @param settlements - Array of settlement edges
 * @returns Array of settlement rounds (each round can be done in parallel)
 */
export function suggestSettlementRounds(settlements: DebtEdge[]): DebtEdge[][] {
  if (settlements.length === 0) {
    return [];
  }

  const rounds: DebtEdge[][] = [];
  const usedUsers = new Set<string>();

  let currentRound: DebtEdge[] = [];

  // Sort settlements by amount (descending)
  const sortedSettlements = [...settlements].sort((a, b) => b.amount - a.amount);

  for (const settlement of sortedSettlements) {
    // Check if either user is already in the current round
    if (usedUsers.has(settlement.from) || usedUsers.has(settlement.to)) {
      // Start a new round
      if (currentRound.length > 0) {
        rounds.push(currentRound);
        currentRound = [];
        usedUsers.clear();
      }
    }

    currentRound.push(settlement);
    usedUsers.add(settlement.from);
    usedUsers.add(settlement.to);
  }

  // Add the last round
  if (currentRound.length > 0) {
    rounds.push(currentRound);
  }

  return rounds;
}

/**
 * Check if a user is involved in any settlement
 *
 * @param settlements - Array of settlement edges
 * @param userId - User ID to check
 * @returns True if user is involved in any settlement
 */
export function isUserInvolvedInSettlements(settlements: DebtEdge[], userId: string): boolean {
  return settlements.some(s => s.from === userId || s.to === userId);
}

/**
 * Get all settlements for a specific user
 *
 * @param settlements - Array of settlement edges
 * @param userId - User ID
 * @returns Array of settlements involving the user
 */
export function getUserSettlements(settlements: DebtEdge[], userId: string): Array<{
  settlement: DebtEdge;
  isPayer: boolean;
}> {
  return settlements
    .filter(s => s.from === userId || s.to === userId)
    .map(settlement => ({
      settlement,
      isPayer: settlement.from === userId,
    }));
}
