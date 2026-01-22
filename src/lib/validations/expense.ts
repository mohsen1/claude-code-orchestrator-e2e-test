import { z } from 'zod';

/**
 * Expense category enum for validation
 */
export const ExpenseCategorySchema = z.enum([
  'FOOD',
  'TRANSPORTATION',
  'ACCOMMODATION',
  'ENTERTAINMENT',
  'UTILITIES',
  'GROCERIES',
  'SHOPPING',
  'HEALTHCARE',
  'EDUCATION',
  'BUSINESS',
  'RENT',
  'OTHER',
]);

/**
 * Schema for creating an expense
 */
export const CreateExpenseSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  amount: z
    .number()
    .int('Amount must be in cents (integer)')
    .positive('Amount must be greater than 0')
    .max(100000000, 'Amount exceeds maximum allowed'),
  category: ExpenseCategorySchema,
  paidBy: z.string().uuid('Invalid payer ID format'),
  paidAt: z.coerce.date().default(() => new Date()),
  attachmentUrl: z.string().url().nullable().optional(),
  splitWith: z.array(z.string().uuid()).optional(),
});

/**
 * Schema for updating an expense
 */
export const UpdateExpenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  amount: z
    .number()
    .int('Amount must be in cents (integer)')
    .positive('Amount must be greater than 0')
    .max(100000000, 'Amount exceeds maximum allowed')
    .optional(),
  category: ExpenseCategorySchema.optional(),
  paidAt: z.coerce.date().optional(),
  attachmentUrl: z.string().url().nullable().optional(),
});

/**
 * Schema for expense search/filter
 */
export const ExpenseSearchParamsSchema = z.object({
  groupId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  category: ExpenseCategorySchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.number().int().positive().optional(),
  maxAmount: z.number().int().positive().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'description', 'category']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema for deleting an expense
 */
export const DeleteExpenseSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID format'),
  reason: z.string().max(500).optional(),
});

/**
 * Schema for expense attachment
 */
export const ExpenseAttachmentSchema = z.object({
  file: z.instanceof(File),
  expenseId: z.string().uuid().optional(),
});

/**
 * Infer types from schemas
 */
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
export type ExpenseSearchParams = z.infer<typeof ExpenseSearchParamsSchema>;
export type DeleteExpenseInput = z.infer<typeof DeleteExpenseSchema>;
export type ExpenseAttachmentInput = z.infer<typeof ExpenseAttachmentSchema>;
