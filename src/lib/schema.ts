// Database schema types and interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
}

// Extended types with related data
export interface GroupWithMembers extends Group {
  members: Array<{ id: string; name: string; email: string; image?: string }>;
  member_count: number;
}

export interface ExpenseWithDetails extends Expense {
  paid_by_user: { id: string; name: string; email: string };
  splits: Array<{ user_id: string; amount: number; user: { id: string; name: string; email: string } }>;
}

// Input types for API
export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface CreateExpenseInput {
  group_id: string;
  description: string;
  amount: number;
  split_with?: string[]; // Array of user IDs to split with (defaults to all group members)
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
}
