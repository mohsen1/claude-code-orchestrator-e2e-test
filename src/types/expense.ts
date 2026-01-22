// Currency types
export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CHF'
  | 'CNY'
  | 'INR'
  | 'MXN'
  | 'BRL'
  | 'KRW'
  | 'RUB'
  | 'ZAR';

export interface Money {
  amount: number; // Stored as integer (cents)
  currency: CurrencyCode;
}

// Money utility functions
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatMoney(amount: number, currency: CurrencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(fromCents(amount));
}

export function addMoney(a: number, b: number): number {
  return a + b;
}

export function subtractMoney(a: number, b: number): number {
  return a - b;
}

export function multiplyMoney(amount: number, factor: number): number {
  return Math.round(amount * factor);
}

export function divideMoney(amount: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Cannot divide by zero');
  }
  return Math.round(amount / divisor);
}

// Expense types
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'education'
  | 'travel'
  | 'other';

export type ExpenseSplitType = 'equal' | 'exact' | 'percentage' | 'custom';

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // Cents
  currency: CurrencyCode;
  paidBy: string; // User ID
  category: ExpenseCategory;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  receiptUrl: string | null;
  notes: string | null;
  splitType: ExpenseSplitType;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // Cents - the amount this user owes
  percentage: number | null; // For percentage-based splits
  paid: boolean; // Whether this split has been settled
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithSplits extends Expense {
  splits: ExpenseSplit[];
  paidByUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface ExpenseBalance {
  userId: string;
  userName: string;
  totalPaid: number; // Cents
  totalOwed: number; // Cents
  balance: number; // Cents (positive = owed money, negative = owes money)
}

// Expense DTOs
export interface CreateExpenseInput {
  groupId: string;
  description: string;
  amount: number; // Will be converted to cents
  currency: CurrencyCode;
  paidBy: string;
  category: ExpenseCategory;
  date: Date;
  splitType: ExpenseSplitType;
  splits?: Array<{
    userId: string;
    amount?: number; // For exact/custom splits
    percentage?: number; // For percentage splits
  }>;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  currency?: CurrencyCode;
  category?: ExpenseCategory;
  date?: Date;
  splitType?: ExpenseSplitType;
  splits?: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
  receiptUrl?: string | null;
  notes?: string | null;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  userBalance: number;
  unsettledCount: number;
}

// Expense validation
export function validateExpenseAmount(amount: number): boolean {
  return amount > 0 && amount <= 100000000; // Max $1,000,000
}

export function validateExpenseDescription(description: string): boolean {
  return description.trim().length >= 3 && description.trim().length <= 500;
}

export function validateExpenseSplits(
  totalAmount: number,
  splits: Array<{ amount?: number; percentage?: number }>,
  splitType: ExpenseSplitType
): { valid: boolean; error?: string } {
  if (splitType === 'equal') {
    return { valid: true };
  }

  if (splitType === 'percentage') {
    const totalPercentage = splits.reduce((sum, s) => sum + (s.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return { valid: false, error: 'Percentages must sum to 100%' };
    }
  }

  if (splitType === 'exact' || splitType === 'custom') {
    const totalSplit = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
    if (Math.abs(totalSplit - totalAmount) > 1) {
      return { valid: false, error: 'Split amounts must equal the total expense' };
    }
  }

  return { valid: true };
}
