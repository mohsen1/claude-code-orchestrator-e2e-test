// Database entity type definitions for the expense-sharing app

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: number;
  created_at: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  // Additional fields from JOINs
  name?: string;
  email?: string;
  avatar_url?: string;
}

export interface Expense {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  paid_by: number;
  category: string | null;
  date: string;
  created_at: string;
  // Additional fields from JOINs
  payer_name?: string;
  group_name?: string;
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: number;
  amount: number;
  share_type: 'equal' | 'exact' | 'percentage';
  // Additional fields from JOINs
  name?: string;
  email?: string;
}

export interface Settlement {
  id: number;
  group_id: number;
  from_user_id: number;
  to_user_id: number;
  amount: number;
  method: string | null;
  notes: string | null;
  settled_at: string;
  // Additional fields from JOINs
  from_user_name?: string;
  to_user_name?: string;
  group_name?: string;
}

export interface Balance {
  user_id: number;
  group_id: number;
  total_paid: number;
  total_owed: number;
  net_balance: number; // Positive = owed money, Negative = owes money
}

// Helper types for creating entities
export type CreateUserInput = Omit<User, 'id' | 'created_at' | 'avatar_url'> & {
  avatar_url?: string | null;
};

export type CreateGroupInput = Omit<Group, 'id' | 'created_at' | 'avatar_url'> & {
  avatar_url?: string | null;
};

export type CreateExpenseInput = Omit<Expense, 'id' | 'created_at'>;

export type CreateExpenseSplitInput = Omit<ExpenseSplit, 'id'>;

export type CreateSettlementInput = Omit<Settlement, 'id' | 'settled_at'>;

// Filter and search types
export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  limit?: number;
}

export interface GroupSummary {
  group_id: number;
  total_expenses: number;
  member_count: number;
  balances: Balance[];
}
