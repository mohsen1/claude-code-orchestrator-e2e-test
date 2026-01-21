/**
 * Expense type definitions
 * Represents expenses and expense splits in the SplitSync application
 */

export type SplitType = 'equal' | 'exact' | 'percentage';

/**
 * Core Expense entity
 * Amount is stored in cents (integer) to avoid floating-point errors
 */
export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number; // In cents (e.g., $10.50 = 1050)
  description: string;
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Expense split - how an expense is divided among users
 */
export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // In cents - the exact amount this user owes
  splitType: SplitType;
  percentage?: number | null; // Only used when splitType is 'percentage'
}

/**
 * Expense with related data
 */
export interface ExpenseWithDetails extends Expense {
  payer: {
    id: string;
    name: string;
    image?: string | null;
  };
  splits: Array<{
    userId: string;
    userName: string;
    amount: number;
    splitType: SplitType;
  }>;
}

/**
 * Expense creation input
 */
export interface CreateExpenseInput {
  groupId: string;
  payerId: string;
  amount: number; // In cents
  description: string;
  category?: string;
  date?: Date; // Defaults to now
  splits?: Array<{
    userId: string;
    amount?: number; // For exact splits
    percentage?: number; // For percentage splits
  }>;
  splitType?: SplitType; // Defaults to 'equal'
}

/**
 * Expense update input
 */
export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: string;
  date?: Date;
}

/**
 * Expense category
 */
export interface ExpenseCategory {
  id: string;
  groupId: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  createdAt: Date;
}

/**
 * Expense statistics
 */
export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number; // In cents
  averageExpense: number; // In cents
  largestExpense: number; // In cents
  expensesByCategory: Array<{
    category: string | null;
    count: number;
    amount: number; // In cents
  }>;
  expensesByMonth: Array<{
    month: string; // YYYY-MM format
    count: number;
    amount: number; // In cents
  }>;
}

/**
 * Simplified expense for list views
 */
export interface ExpenseListItem {
  id: string;
  description: string;
  amount: number;
  date: Date;
  payerName: string;
  category?: string | null;
  splitCount: number;
}
