import { z } from 'zod';

// Group validation schemas
export const createGroupSchema = z.object({
  name: z.string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must not exceed 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),
  memberEmails: z.array(z.string().email('Invalid email address'))
    .max(20, 'Cannot invite more than 20 members at once')
    .optional(),
});

export const updateGroupSchema = z.object({
  name: z.string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must not exceed 100 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']).optional().default('member'),
});

export const removeMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  role: z.enum(['admin', 'member']),
});

// Expense validation schemas
export const createExpenseSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount must not exceed 1,000,000'),
  paidBy: z.string().min(1, 'Payer user ID is required'),
  category: z.string()
    .max(50, 'Category must not exceed 50 characters')
    .trim()
    .optional(),
  date: z.coerce.date().optional(),
  splitType: z.enum(['equal', 'custom', 'percentage']),
  splits: z.array(z.object({
    userId: z.string().min(1, 'User ID is required'),
    amount: z.number().positive('Amount must be positive').optional(),
    percentage: z.number()
      .min(0, 'Percentage must be between 0 and 100')
      .max(100, 'Percentage must be between 0 and 100')
      .optional(),
  })).optional(),
}).refine((data) => {
  // Validate splits based on splitType
  if (data.splitType === 'custom') {
    return data.splits && data.splits.length > 0 &&
           data.splits.every(split => split.amount !== undefined);
  }
  if (data.splitType === 'percentage') {
    return data.splits && data.splits.length > 0 &&
           data.splits.every(split => split.percentage !== undefined);
  }
  return true;
}, {
  message: 'Invalid splits for the specified split type',
  path: ['splits'],
});

export const updateExpenseSchema = z.object({
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount must not exceed 1,000,000')
    .optional(),
  category: z.string()
    .max(50, 'Category must not exceed 50 characters')
    .trim()
    .optional(),
  date: z.coerce.date().optional(),
});

export const deleteExpenseSchema = z.object({
  expenseId: z.string().min(1, 'Expense ID is required'),
});

// Settlement validation schemas
export const createSettlementSchema = z.object({
  fromUserId: z.string().min(1, 'From user ID is required'),
  toUserId: z.string().min(1, 'To user ID is required'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount must not exceed 1,000,000'),
  groupId: z.string().min(1, 'Group ID is required'),
});

// Group invite validation schemas
export const createInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  expiresIn: z.number()
    .positive('Expiration time must be positive')
    .max(30, 'Expiration time must not exceed 30 days')
    .optional()
    .default(7),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
});

// Query parameter validation schemas
export const groupQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  categoryId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Type exports
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type DeleteExpenseInput = z.infer<typeof deleteExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type GroupQueryParams = z.infer<typeof groupQuerySchema>;
export type ExpenseQueryParams = z.infer<typeof expenseQuerySchema>;
