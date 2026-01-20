export interface Expense {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  paid_by: number;
  created_at: string;
}

export interface ExpenseDTO {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  paid_by: number;
  paid_by_name: string;
  created_at: string;
}

export interface CreateExpenseInput {
  group_id: number;
  description: string;
  amount: number;
  paid_by: number;
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: number;
  amount: number;
}

export interface Balance {
  user_id: number;
  user_name: string;
  amount: number;
}

export interface Debt {
  from: number;
  from_name: string;
  to: number;
  to_name: string;
  amount: number;
  settled: boolean;
}

export interface SettleDebtInput {
  group_id: number;
  from: number;
  to: number;
  amount: number;
}
