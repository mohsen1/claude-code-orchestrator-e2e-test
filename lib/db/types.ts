// API Request/Response Types

export interface CreateExpenseRequest {
  group_id: string;
  description: string;
  amount: number;
  currency?: string;
  paid_by: string;
  category?: string;
  date?: string;
  split_with?: string[];
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  date?: string;
  split_with?: string[];
}

export interface ExpenseResponse {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  category?: string;
  date: string;
  created_at: string;
  updated_at: string;
  paid_by_user?: {
    id: string;
    name: string;
    email: string;
  };
  splits?: Array<{
    id: string;
    expense_id: string;
    user_id: string;
    amount: number;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
  count?: number;
}

export interface Balance {
  user_id: string;
  balance: number;
}

export interface GroupBalance {
  group_id: string;
  balances: Record<string, number>;
}
