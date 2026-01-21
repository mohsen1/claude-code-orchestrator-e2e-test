/**
 * Settlement domain type
 * Represents a settlement between users (debt repayment)
 */
export interface Settlement {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount_cents: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: Date;
  completed_at?: Date;
}

/**
 * Settlement creation input
 */
export interface CreateSettlementInput {
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount_cents: number;
}

/**
 * Settlement update input
 */
export interface UpdateSettlementInput {
  status?: 'pending' | 'completed' | 'cancelled';
}

/**
 * Settlement with user information
 */
export interface SettlementWithUsers extends Settlement {
  from_user_name: string;
  to_user_name: string;
  group_name: string;
}

/**
 * Settlement summary for a user
 * Shows total owed and owing amounts
 */
export interface SettlementSummary {
  user_id: string;
  total_owed_cents: number; // Amount others owe this user
  total_owing_cents: number; // Amount this user owes others
  net_balance_cents: number; // Positive = net receiver, Negative = net payer
}
