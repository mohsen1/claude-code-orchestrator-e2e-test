export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // Stored in cents (integer)
  paidBy: string;
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // Stored in cents (integer)
}

export interface ExpenseWithSplits extends Expense {
  splits: Array<{
    userId: string;
    amount: number;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }>;
  paidByUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export type CreateExpenseInput = {
  description: string;
  amount: number; // In cents (integer)
  paidBy: string;
  groupId: string;
  category?: string;
  date?: Date;
  splitWith?: string[]; // Array of user IDs to split with (defaults to all group members)
};

export type UpdateExpenseInput = Partial<
  Omit<CreateExpenseInput, 'groupId' | 'paidBy'>
>;
