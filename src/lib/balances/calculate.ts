import { Expense, ExpenseSplit, Payment, Balance, GroupBalanceSummary, UserBalanceDetail, Debt } from './types';

/**
 * Calculate balances for a group based on expenses and payments
 * Positive balance = owed money (others owe them)
 * Negative balance = owes money
 */
export function calculateGroupBalances(
  expenses: Expense[],
  expenseSplits: ExpenseSplit[],
  payments: Payment[],
  memberIds: string[]
): GroupBalanceSummary {
  // Initialize balances map
  const balances = new Map<string, number>();
  for (const memberId of memberIds) {
    balances.set(memberId, 0);
  }

  // Process expenses
  let totalExpenses = 0;
  for (const expense of expenses) {
    totalExpenses += expense.amount;

    // The person who paid gets credited
    const currentBalance = balances.get(expense.paidByUserId) || 0;
    balances.set(expense.paidByUserId, currentBalance + expense.amount);

    // Deduct each person's share
    const splitsForExpense = expenseSplits.filter(s => s.expenseId === expense.id);
    for (const split of splitsForExpense) {
      const userBalance = balances.get(split.userId) || 0;
      balances.set(split.userId, userBalance - split.amount);
    }
  }

  // Process payments
  let totalPayments = 0;
  for (const payment of payments) {
    totalPayments += payment.amount;

    // Person who sent money loses that amount
    const fromBalance = balances.get(payment.fromUserId) || 0;
    balances.set(payment.fromUserId, fromBalance - payment.amount);

    // Person who received money gains that amount
    const toBalance = balances.get(payment.toUserId) || 0;
    balances.set(payment.toUserId, toBalance + payment.amount);
  }

  // Calculate optimal debts (who should pay whom to settle up)
  const debts = calculateOptimalDebts(balances);

  return {
    groupId: expenses[0]?.groupId || '',
    balances,
    debts,
    totalExpenses,
    totalPayments,
  };
}

/**
 * Calculate optimal debts to minimize transactions
 * Uses a greedy algorithm to match debtors with creditors
 */
export function calculateOptimalDebts(balances: Map<string, number>): Debt[] {
  const debts: Debt[] = [];

  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors: Array<{ userId: string; amount: number }> = [];
  const debtors: Array<{ userId: string; amount: number }> = [];

  for (const [userId, balance] of balances.entries()) {
    if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: -balance });
    }
  }

  // Sort both arrays by amount (descending)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Match debtors with creditors
  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.amount, debtor.amount);

    if (amount > 0.01) {
      debts.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: Math.round(amount * 100) / 100,
        groupId: '', // Will be set by caller
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return debts;
}

/**
 * Calculate detailed balance information for a specific user
 */
export function calculateUserBalanceDetail(
  userId: string,
  groupId: string,
  allUsers: Map<string, { name: string; email: string }>,
  summary: GroupBalanceSummary
): UserBalanceDetail {
  const balance = summary.balances.get(userId) || 0;

  // Calculate what this user owes to others
  const owesTo = summary.debts
    .filter(debt => debt.fromUserId === userId)
    .map(debt => ({
      userId: debt.toUserId,
      userName: allUsers.get(debt.toUserId)?.name || 'Unknown',
      amount: debt.amount,
    }));

  // Calculate what others owe to this user
  const owedBy = summary.debts
    .filter(debt => debt.toUserId === userId)
    .map(debt => ({
      userId: debt.fromUserId,
      userName: allUsers.get(debt.fromUserId)?.name || 'Unknown',
      amount: debt.amount,
    }));

  // Calculate total paid and owed
  let totalPaid = 0;
  let totalOwed = 0;

  for (const [id, bal] of summary.balances.entries()) {
    if (id === userId) {
      if (bal > 0) {
        totalPaid = bal;
      } else {
        totalOwed = -bal;
      }
    }
  }

  return {
    user: {
      id: userId,
      name: allUsers.get(userId)?.name || 'Unknown',
      email: allUsers.get(userId)?.email || '',
    },
    balance,
    totalPaid,
    totalOwed,
    owesTo,
    owedBy,
  };
}

/**
 * Calculate if a group is settled (no outstanding debts)
 */
export function isGroupSettled(summary: GroupBalanceSummary): boolean {
  return summary.debts.length === 0;
}

/**
 * Calculate the total amount owed to a user
 */
export function getTotalOwedToUser(userId: string, summary: GroupBalanceSummary): number {
  return summary.debts
    .filter(debt => debt.toUserId === userId)
    .reduce((sum, debt) => sum + debt.amount, 0);
}

/**
 * Calculate the total amount a user owes
 */
export function getTotalOwedByUser(userId: string, summary: GroupBalanceSummary): number {
  return summary.debts
    .filter(debt => debt.fromUserId === userId)
    .reduce((sum, debt) => sum + debt.amount, 0);
}

/**
 * Get simplified balance summary for UI display
 */
export function getSimplifiedBalances(summary: GroupBalanceSummary): Array<{
  userId: string;
  balance: number;
  status: 'settled' | 'owes' | 'owed';
}> {
  const result: Array<{
    userId: string;
    balance: number;
    status: 'settled' | 'owes' | 'owed';
  }> = [];

  for (const [userId, balance] of summary.balances.entries()) {
    let status: 'settled' | 'owes' | 'owed' = 'settled';

    if (balance < -0.01) {
      status = 'owes';
    } else if (balance > 0.01) {
      status = 'owed';
    }

    result.push({
      userId,
      balance: Math.round(balance * 100) / 100,
      status,
    });
  }

  return result;
}
