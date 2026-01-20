import { z } from 'zod';

// Database Model Schema
export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  payerId: z.string().uuid(),
  amount: z.number().int().positive('Amount must be positive (stored in cents/lowest unit)'),
  description: z.string().min(1, 'Description is required').max(500),
  date: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Expense Split Schema (junction table for splitting expenses)
export const ExpenseSplitSchema = z.object({
  expenseId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().int().nonnegative('Split amount must be non-negative'),
});

// Create Expense Schema
export const CreateExpenseSchema = ExpenseSchema.pick({
  groupId: true,
  payerId: true,
  amount: true,
  description: true,
  date: true,
}).extend({
  // Optional: specify custom splits
  splits: z.array(z.object({
    userId: z.string().uuid(),
    amount: z.number().int().nonnegative(),
  })).optional(),
});

// Update Expense Schema
export const UpdateExpenseSchema = ExpenseSchema.pick({
  amount: true,
  description: true,
  date: true,
}).partial();

// Expense Split Algorithm Types
export type SplitType = 'equal' | 'exact' | 'percentage';

export const SplitCalculationSchema = z.object({
  type: z.enum(['equal', 'exact', 'percentage']),
  totalAmount: z.number().int().positive(),
  userIds: z.array(z.string().uuid()).min(1, 'At least one user must be specified'),
  // For 'exact' splits: specific amounts per user
  exactAmounts: z.record(z.string().uuid(), z.number().int().nonnegative()).optional(),
  // For 'percentage' splits: percentages per user (must sum to 100)
  percentages: z.record(z.string().uuid(), z.number().min(0).max(100)).optional(),
});

// TypeScript Types
export type Expense = z.infer<typeof ExpenseSchema>;
export type ExpenseSplit = z.infer<typeof ExpenseSplitSchema>;
export type CreateExpense = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpense = z.infer<typeof UpdateExpenseSchema>;
export type SplitCalculation = z.infer<typeof SplitCalculationSchema>;

// Expense with Relations Response Type
export type ExpenseWithRelations = Expense & {
  payer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  splits: (ExpenseSplit & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
};

// Expense Summary for Dashboard
export type ExpenseSummary = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  payerName: string;
  splitAmong: string[];
};
