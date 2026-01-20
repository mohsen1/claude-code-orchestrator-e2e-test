import { z } from 'zod';

/**
 * Zod schemas for expense validation
 */

export const expenseSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  category: z.string().optional(),
  paidBy: z.string().min(1, 'Payer ID is required'),
  date: z.string().optional().default(() => new Date().toISOString()),
  splitType: z.enum(['EQUAL', 'CUSTOM', 'PERCENTAGE']).default('EQUAL'),
  splits: z.array(z.object({
    userId: z.string().min(1, 'User ID is required'),
    amount: z.number().nonnegative('Amount must be non-negative').optional(),
    percentage: z.number().min(0).max(100).optional(),
  })).min(1, 'At least one split is required'),
});

export const updateExpenseSchema = expenseSchema.partial().extend({
  groupId: z.string().min(1, 'Group ID is required').optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

/**
 * Validates expense data against the schema
 */
export function validateExpense(data: unknown): ExpenseInput {
  return expenseSchema.parse(data);
}

/**
 * Validates expense update data against the schema
 */
export function validateExpenseUpdate(data: unknown): UpdateExpenseInput {
  return updateExpenseSchema.parse(data);
}

/**
 * Custom validation for expense splits
 */
export function validateExpenseSplits(
  totalAmount: number,
  splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE',
  splits: Array<{ userId: string; amount?: number; percentage?: number }>
): void {
  if (splits.length === 0) {
    throw new Error('At least one split is required');
  }

  const uniqueUsers = new Set(splits.map(s => s.userId));
  if (uniqueUsers.size !== splits.length) {
    throw new Error('Duplicate users found in splits');
  }

  if (splitType === 'CUSTOM') {
    const splitTotal = splits.reduce((sum, split) => sum + (split.amount || 0), 0);
    if (Math.abs(splitTotal - totalAmount) > 0.01) {
      throw new Error(
        `Split amounts (${splitTotal.toFixed(2)}) must equal total amount (${totalAmount.toFixed(2)})`
      );
    }
  }

  if (splitType === 'PERCENTAGE') {
    const percentageTotal = splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
    if (Math.abs(percentageTotal - 100) > 0.01) {
      throw new Error(
        `Split percentages (${percentageTotal.toFixed(2)}%) must equal 100%`
      );
    }
  }
}
