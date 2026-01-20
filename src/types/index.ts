export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
}
