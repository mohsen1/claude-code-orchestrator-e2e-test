import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Group validation schemas
export const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(50),
  description: z.string().max(500).optional().nullable(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(50).optional(),
  description: z.string().max(500).optional().nullable(),
});

// Expense validation schemas
export const createExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200),
  amount: z.number()
    .int('Amount must be in whole cents')
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1 cent'),
  paidBy: z.string().uuid('Invalid user ID'),
  category: z.string().max(50).optional().nullable(),
  date: z.coerce.date().optional(),
  splitType: z.enum(['equal', 'percentage', 'exact'], {
    errorMap: () => ({ message: 'Invalid split type' }),
  }),
  splits: z.array(z.object({
    userId: z.string().uuid('Invalid user ID'),
    amount: z.number().int().positive().optional(),
    percentage: z.number().min(0).max(100).optional(),
  })).min(1, 'At least one split is required'),
}).refine((data) => {
  // Validate percentage splits add up to 100
  if (data.splitType === 'percentage') {
    const total = data.splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
    return Math.abs(total - 100) < 0.01;
  }
  // Validate exact splits add up to total amount
  if (data.splitType === 'exact') {
    const total = data.splits.reduce((sum, split) => sum + (split.amount || 0), 0);
    return total === data.amount;
  }
  return true;
}, {
  message: 'Split amounts must equal the total expense',
  path: ['splits'],
});

// Settlement validation schemas
export const createSettlementSchema = z.object({
  from: z.string().uuid('Invalid user ID'),
  to: z.string().uuid('Invalid user ID'),
  amount: z.number()
    .int('Amount must be in whole cents')
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1 cent'),
}).refine((data) => data.from !== data.to, {
  message: 'Cannot settle with yourself',
  path: ['from'],
});

// API parameter validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const groupIdSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
});

export const expenseIdSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID'),
});

export const userIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
