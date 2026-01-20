// Expense interface representing a complete expense object
export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
}

// ExpenseInput type for creating new expenses (without id and createdAt)
export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;
