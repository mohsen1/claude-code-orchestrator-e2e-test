import { Debt, Payment, GroupBalanceSummary } from './types';

/**
 * Generate a unique ID for payments
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a payment record from a debt
 */
export function createPaymentFromDebt(debt: Debt, groupId: string): Payment {
  return {
    id: generateId(),
    groupId,
    fromUserId: debt.fromUserId,
    toUserId: debt.toUserId,
    amount: debt.amount,
    date: new Date(),
    createdAt: new Date(),
  };
}

/**
 * Validate if a payment amount is valid given current debts
 */
export function validatePaymentAmount(
  fromUserId: string,
  toUserId: string,
  amount: number,
  summary: GroupBalanceSummary
): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return {
      valid: false,
      error: 'Payment amount must be positive',
    };
  }

  // Check if fromUserId actually owes money
  const debt = summary.debts.find(
    d => d.fromUserId === fromUserId && d.toUserId === toUserId
  );

  if (!debt) {
    return {
      valid: false,
      error: `${fromUserId} does not owe ${toUserId} any money`,
    };
  }

  // Check if payment amount exceeds debt
  const maxPayment = debt.amount;
  if (amount > maxPayment + 0.01) {
    return {
      valid: false,
      error: `Payment amount (${amount.toFixed(2)}) exceeds debt (${maxPayment.toFixed(2)})`,
    };
  }

  return { valid: true };
}

/**
 * Get all debts for a specific user
 */
export function getUserDebts(userId: string, summary: GroupBalanceSummary): {
  owes: Debt[];
  owed: Debt[];
  totalOwes: number;
  totalOwed: number;
} {
  const owes = summary.debts.filter(d => d.fromUserId === userId);
  const owed = summary.debts.filter(d => d.toUserId === userId);

  const totalOwes = owes.reduce((sum, d) => sum + d.amount, 0);
  const totalOwed = owed.reduce((sum, d) => sum + d.amount, 0);

  return {
    owes,
    owed,
    totalOwes: Math.round(totalOwes * 100) / 100,
    totalOwed: Math.round(totalOwed * 100) / 100,
  };
}

/**
 * Get settlement suggestions to minimize transactions
 */
export function getSettlementSuggestions(
  summary: GroupBalanceSummary,
  userNames: Map<string, string>
): Array<{
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}> {
  return summary.debts.map(debt => ({
    fromUserId: debt.fromUserId,
    fromUserName: userNames.get(debt.fromUserId) || 'Unknown',
    toUserId: debt.toUserId,
    toUserName: userNames.get(debt.toUserId) || 'Unknown',
    amount: debt.amount,
  }));
}

/**
 * Check if a specific debt exists
 */
export function hasDebt(
  fromUserId: string,
  toUserId: string,
  summary: GroupBalanceSummary
): boolean {
  return summary.debts.some(
    d => d.fromUserId === fromUserId && d.toUserId === toUserId && d.amount > 0.01
  );
}

/**
 * Get the amount one user owes another
 */
export function getDebtAmount(
  fromUserId: string,
  toUserId: string,
  summary: GroupBalanceSummary
): number {
  const debt = summary.debts.find(
    d => d.fromUserId === fromUserId && d.toUserId === toUserId
  );
  return debt ? debt.amount : 0;
}

/**
 * Create partial payment (when user pays part of what they owe)
 */
export function createPartialPayment(
  fromUserId: string,
  toUserId: string,
  amount: number,
  groupId: string,
  originalDebt: Debt
): Payment {
  return {
    id: generateId(),
    groupId,
    fromUserId,
    toUserId,
    amount: Math.min(amount, originalDebt.amount),
    date: new Date(),
    createdAt: new Date(),
  };
}

/**
 * Calculate remaining debt after a payment
 */
export function calculateRemainingDebt(
  fromUserId: string,
  toUserId: string,
  paymentAmount: number,
  summary: GroupBalanceSummary
): number {
  const currentDebt = getDebtAmount(fromUserId, toUserId, summary);
  return Math.max(0, Math.round((currentDebt - paymentAmount) * 100) / 100);
}

/**
 * Get all users involved in debts (either owing or owed)
 */
export function getInvolvedUsers(summary: GroupBalanceSummary): Set<string> {
  const users = new Set<string>();

  for (const debt of summary.debts) {
    users.add(debt.fromUserId);
    users.add(debt.toUserId);
  }

  return users;
}

/**
 * Format debt for display
 */
export function formatDebt(debt: Debt, fromName: string, toName: string): string {
  return `${fromName} owes ${toName} $${debt.amount.toFixed(2)}`;
}

/**
 * Check if group can be fully settled with current debts
 */
export function canSettleGroup(summary: GroupBalanceSummary): boolean {
  // Group can be settled if total positive balances equals total negative balances
  let positiveSum = 0;
  let negativeSum = 0;

  for (const balance of summary.balances.values()) {
    if (balance > 0) {
      positiveSum += balance;
    } else if (balance < 0) {
      negativeSum += -balance;
    }
  }

  return Math.abs(positiveSum - negativeSum) < 0.01;
}

/**
 * Get payment history for a group
 */
export function getPaymentHistory(payments: Payment[]): Array<{
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: Date;
}> {
  return payments
    .map(payment => ({
      id: payment.id,
      fromUserId: payment.fromUserId,
      toUserId: payment.toUserId,
      amount: payment.amount,
      date: payment.date,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Validate payment before recording
 */
export function validatePayment(
  fromUserId: string,
  toUserId: string,
  amount: number,
  summary: GroupBalanceSummary
): { valid: boolean; error?: string } {
  if (!fromUserId || !toUserId) {
    return {
      valid: false,
      error: 'From user ID and to user ID are required',
    };
  }

  if (fromUserId === toUserId) {
    return {
      valid: false,
      error: 'Cannot make payment to yourself',
    };
  }

  if (amount <= 0) {
    return {
      valid: false,
      error: 'Payment amount must be positive',
    };
  }

  if (!Number.isFinite(amount)) {
    return {
      valid: false,
      error: 'Payment amount must be a valid number',
    };
  }

  // Check if sender has sufficient negative balance (owes money)
  const senderBalance = summary.balances.get(fromUserId) || 0;
  if (senderBalance >= 0) {
    return {
      valid: false,
      error: 'User does not owe any money in this group',
    };
  }

  // Check if recipient is owed money
  const recipientBalance = summary.balances.get(toUserId) || 0;
  if (recipientBalance <= 0) {
    return {
      valid: false,
      error: 'Recipient is not owed any money in this group',
    };
  }

  // Check if payment doesn't exceed what's owed
  const debtAmount = getDebtAmount(fromUserId, toUserId, summary);
  if (amount > debtAmount + 0.01) {
    return {
      valid: false,
      error: `Payment amount ($${amount.toFixed(2)}) exceeds debt ($${debtAmount.toFixed(2)})`,
    };
  }

  return { valid: true };
}
