/**
 * Expense type definitions for SplitSync
 * All amounts are stored as integers to avoid floating-point errors
 */

import { CurrencyCode, MonetaryAmount } from './currency';
import type { UserId, GroupId } from './user';
import type { GroupId as ExpenseGroupId } from './group';

/**
 * Unique identifier for expenses (UUID v4)
 */
export type ExpenseId = string;

/**
 * Unique identifier for expense splits (composite: expenseId + userId)
 */
export type ExpenseSplitId = string;

/**
 * Expense status
 */
export type ExpenseStatus = 'draft' | 'active' | 'archived';

/**
 * Split types for expenses
 */
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

/**
 * Expense split details
 */
export interface ExpenseSplit {
  expenseId: ExpenseId;
  userId: UserId;
  amount: MonetaryAmount; // The exact amount this user owes
  percentage: number | null; // Percentage if split by percentage
  shares: number | null; // Number of shares if split by shares
  paid: boolean; // Whether this split has been settled
  paidAt: Date | null; // When this split was settled
  paidBy: UserId | null; // Who paid this split (for settlements)
}

/**
 * Complete expense information
 */
export interface Expense {
  id: ExpenseId;
  groupId: ExpenseGroupId;
  payerId: UserId; // User who paid the expense
  amount: MonetaryAmount; // Total amount in cents/smallest unit
  currency: CurrencyCode;
  description: string;
  category: string | null; // Category ID or name
  splitType: SplitType;
  date: Date; // When the expense occurred
  receiptUrl: string | null; // URL to receipt image
  notes: string | null;
  status: ExpenseStatus;
  createdBy: UserId; // Who created this expense record
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Expense data for creation
 */
export interface ExpenseCreateInput {
  groupId: ExpenseGroupId;
  payerId: UserId;
  amount: MonetaryAmount;
  description: string;
  currency?: CurrencyCode;
  category?: string | null;
  splitType?: SplitType;
  date?: Date | string;
  receiptUrl?: string | null;
  notes?: string | null;
  splits: Omit<ExpenseSplit, 'expenseId' | 'paid' | 'paidAt' | 'paidBy'>[];
}

/**
 * Expense data for updates
 */
export interface ExpenseUpdateInput {
  payerId?: UserId;
  amount?: MonetaryAmount;
  description?: string;
  category?: string | null;
  splitType?: SplitType;
  date?: Date | string;
  receiptUrl?: string | null;
  notes?: string | null;
  status?: ExpenseStatus;
  splits?: Omit<ExpenseSplit, 'expenseId' | 'paid' | 'paidAt' | 'paidBy'>[];
}

/**
 * Minimal expense info for displays
 */
export interface ExpenseMinimal {
  id: ExpenseId;
  description: string;
  amount: MonetaryAmount;
  currency: CurrencyCode;
  date: Date;
}

/**
 * Expense with split details
 */
export interface ExpenseWithSplits extends Expense {
  splits: Array<ExpenseSplit & {
    user: {
      id: UserId;
      name: string;
      image: string | null;
    };
  }>;
  payer: {
    id: UserId;
    name: string;
    image: string | null;
  };
}

/**
 * Expense category statistics
 */
export interface ExpenseCategoryStats {
  category: string;
  count: number;
  totalAmount: MonetaryAmount;
  averageAmount: MonetaryAmount;
  percentage: number; // Of total expenses
}

/**
 * Expense statistics for a group
 */
export interface ExpenseStatistics {
  groupId: ExpenseGroupId;
  totalExpenses: number;
  totalAmount: MonetaryAmount;
  averageAmount: MonetaryAmount;
  medianAmount: MonetaryAmount;
  largestExpense: {
    id: ExpenseId;
    description: string;
    amount: MonetaryAmount;
    date: Date;
  } | null;
  smallestExpense: {
    id: ExpenseId;
    description: string;
    amount: MonetaryAmount;
    date: Date;
  } | null;
  categoryBreakdown: ExpenseCategoryStats[];
  topPayers: Array<{
    userId: UserId;
    userName: string;
    totalPaid: MonetaryAmount;
    expenseCount: number;
  }>;
  monthlyTrend: Array<{
    month: string; // Format: "YYYY-MM"
    count: number;
    totalAmount: MonetaryAmount;
  }>;
}

/**
 * Settlement (payment between users)
 */
export interface Settlement {
  id: string;
  groupId: ExpenseGroupId;
  fromUserId: UserId; // User who owes money
  toUserId: UserId; // User who is owed money
  amount: MonetaryAmount; // Amount being settled
  currency: CurrencyCode;
  date: Date; // When the settlement occurred
  method: string | null; // e.g., "cash", "venmo", "bank_transfer"
  notes: string | null;
  confirmedAt: Date | null; // When settlement was confirmed
  createdAt: Date;
}

/**
 * Settlement data for creation
 */
export interface SettlementCreateInput {
  groupId: ExpenseGroupId;
  fromUserId: UserId;
  toUserId: UserId;
  amount: MonetaryAmount;
  currency: CurrencyCode;
  date?: Date | string;
  method?: string | null;
  notes?: string | null;
}

/**
 * Settlement with user details
 */
export interface SettlementWithUsers extends Settlement {
  fromUser: {
    id: UserId;
    name: string;
    image: string | null;
  };
  toUser: {
    id: UserId;
    name: string;
    image: string | null;
  };
}

/**
 * Simplified debt graph (optimized settlements)
 * Shows who should pay whom to minimize transactions
 */
export interface SimplifiedDebt {
  fromUserId: UserId;
  fromUserName: string;
  toUserId: UserId;
  toUserName: string;
  amount: MonetaryAmount;
}

/**
 * Type guard to check if expense is deleted
 */
export function isExpenseDeleted(expense: Expense): boolean {
  return expense.deletedAt !== null;
}

/**
 * Type guard to check if expense is active
 */
export function isExpenseActive(expense: Expense): boolean {
  return expense.status === 'active' && expense.deletedAt === null;
}

/**
 * Type guard to check if split is paid
 */
export function isSplitPaid(split: ExpenseSplit): boolean {
  return split.paid === true && split.paidAt !== null;
}

/**
 * Calculate total amount from splits
 */
export function calculateTotalFromSplits(splits: ExpenseSplit[]): MonetaryAmount {
  const total = splits.reduce((sum, split) => sum + split.amount, 0);

  if (total < 0) {
    throw new Error('Total split amount cannot be negative');
  }

  return total;
}

/**
 * Validate that splits sum to the expense amount
 */
export function validateSplits(expenseAmount: MonetaryAmount, splits: ExpenseSplit[]): boolean {
  const splitsTotal = calculateTotalFromSplits(splits);
  return splitsTotal === expenseAmount;
}

/**
 * Calculate percentage-based splits
 */
export function calculatePercentageSplits(
  expenseAmount: MonetaryAmount,
  percentages: Array<{ userId: UserId; percentage: number }>
): ExpenseSplit[] {
  // Validate percentages sum to 100
  const totalPercentage = percentages.reduce((sum, p) => sum + p.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Percentages must sum to 100');
  }

  const splits: ExpenseSplit[] = [];
  let allocatedAmount = 0;

  for (let i = 0; i < percentages.length; i++) {
    const { userId, percentage } = percentages[i];
    const isLast = i === percentages.length - 1;

    // For last user, assign remaining amount to handle rounding
    const amount = isLast
      ? expenseAmount - allocatedAmount
      : Math.round((expenseAmount * percentage) / 100);

    splits.push({
      expenseId: '', // Will be set when expense is created
      userId,
      amount,
      percentage,
      shares: null,
      paid: false,
      paidAt: null,
      paidBy: null,
    });

    allocatedAmount += amount;
  }

  return splits;
}

/**
 * Calculate equal splits
 */
export function calculateEqualSplits(
  expenseAmount: MonetaryAmount,
  userIds: UserId[]
): ExpenseSplit[] {
  if (userIds.length === 0) {
    throw new Error('Cannot split expense with zero users');
  }

  const amounts = equalSplit(expenseAmount, userIds.length);

  return userIds.map((userId, index) => ({
    expenseId: '',
    userId,
    amount: amounts[index],
    percentage: null,
    shares: null,
    paid: false,
    paidAt: null,
    paidBy: null,
  }));
}

/**
 * Calculate shares-based splits
 */
export function calculateSharesSplits(
  expenseAmount: MonetaryAmount,
  shares: Array<{ userId: UserId; shares: number }>
): ExpenseSplit[] {
  const totalShares = shares.reduce((sum, s) => sum + s.shares, 0);

  if (totalShares === 0) {
    throw new Error('Total shares cannot be zero');
  }

  const splits: ExpenseSplit[] = [];
  let allocatedAmount = 0;

  for (let i = 0; i < shares.length; i++) {
    const { userId, shares: userShares } = shares[i];
    const isLast = i === shares.length - 1;

    const amount = isLast
      ? expenseAmount - allocatedAmount
      : Math.round((expenseAmount * userShares) / totalShares);

    splits.push({
      expenseId: '',
      userId,
      amount,
      percentage: null,
      shares: userShares,
      paid: false,
      paidAt: null,
      paidBy: null,
    });

    allocatedAmount += amount;
  }

  return splits;
}

/**
 * Split amount equally among n people, handling remainder
 * @private
 */
function equalSplit(amount: MonetaryAmount, n: number): MonetaryAmount[] {
  const baseAmount = Math.floor(amount / n);
  const remainder = amount % n;

  const result: MonetaryAmount[] = [];
  for (let i = 0; i < n; i++) {
    result.push(baseAmount + (i < remainder ? 1 : 0));
  }

  return result;
}

/**
 * Expense receipt metadata
 */
export interface ExpenseReceipt {
  id: string;
  expenseId: ExpenseId;
  url: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: UserId;
}
