/**
 * Expense domain type
 * Represents an expense within a group
 */
export interface Expense {
  id: string;
  group_id: string;
  payer_id: string;
  amount_cents: number;
  description: string;
  split_type: 'equal' | 'unequal' | 'percentage';
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Expense creation input
 */
export interface CreateExpenseInput {
  group_id: string;
  payer_id: string;
  amount_cents: number;
  description: string;
  split_type: 'equal' | 'unequal' | 'percentage';
}

/**
 * Expense update input
 */
export interface UpdateExpenseInput {
  amount_cents?: number;
  description?: string;
  split_type?: 'equal' | 'unequal' | 'percentage';
}

/**
 * Expense with related information
 */
export interface ExpenseWithDetails extends Expense {
  payer_name: string;
  group_name: string;
  split_amounts?: Array<{
    user_id: string;
    user_name: string;
    amount_cents: number;
  }>;
}

/**
 * Expense split allocation
 * Used for unequal or percentage-based splits
 */
export interface ExpenseSplit {
  user_id: string;
  amount_cents?: number;
  percentage?: number;
}
