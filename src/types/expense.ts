/**
 * Expense-related types and interfaces
 */

import { UUID } from './api';

/**
 * Expense entity representation
 * All amounts are stored in cents (integer) to avoid floating-point errors
 */
export interface Expense {
  id: UUID;
  groupId: UUID;
  payerId: UUID;
  amount: number; // Always stored in cents (integer)
  description: string;
  date: Date;
  createdAt: Date;
}

/**
 * Individual expense split for a user
 */
export interface ExpenseSplit {
  expenseId: UUID;
  userId: UUID;
  amount: number; // The exact amount this user owes (in cents)
}

/**
 * Split type for expense allocation
 */
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

/**
 * User-specific split allocation
 */
export interface SplitAllocation {
  userId: UUID;
  amount?: number; // For 'exact' split type (in cents)
  percentage?: number; // For 'percentage' split type (0-100)
  shares?: number; // For 'shares' split type
}

/**
 * Expense creation payload
 */
export interface CreateExpenseInput {
  groupId: UUID;
  payerId: UUID;
  amount: number; // In cents (must be positive integer)
  description: string;
  date?: Date;
  splitType?: SplitType;
  splits?: SplitAllocation[];
}

/**
 * Expense update payload
 */
export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  date?: Date;
}

/**
 * Expense with populated payer and split information
 */
export interface ExpenseWithDetails extends Expense {
  payer: {
    id: UUID;
    name: string;
    image?: string | null;
  };
  splits: Array<ExpenseSplit & {
    user: {
      id: UUID;
      name: string;
      image?: string | null;
    };
  }>;
}

/**
 * Expense summary for dashboard/list views
 */
export interface ExpenseSummary {
  id: UUID;
  description: string;
  amount: number;
  date: Date;
  payerName: string;
  yourShare?: number; // Amount the requesting user owes
}
