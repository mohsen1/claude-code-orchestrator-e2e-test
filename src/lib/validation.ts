import { z } from 'zod';

/**
 * Common validation schemas
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const urlSchema = z.string().url('Invalid URL').max(2048, 'URL is too long');

export const currencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'KRW', 'RUB', 'ZAR'], {
  errorMap: () => ({ message: 'Invalid currency code' }),
});

export const amountSchema = z
  .number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  })
  .positive('Amount must be positive')
  .max(100000000, 'Amount is too large');

/**
 * Auth validation schemas
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  callbackUrl: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

/**
 * Group validation schemas
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  currency: currencyCodeSchema,
});

export const updateGroupSchema = z
  .object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    currency: currencyCodeSchema.optional(),
    status: z.enum(['active', 'archived', 'deleted']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const inviteMemberSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  email: emailSchema,
  role: z.enum(['admin', 'member']).optional(),
});

/**
 * Expense validation schemas
 */
export const expenseCategorySchema = z.enum(
  ['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'shopping', 'health', 'education', 'travel', 'other'],
  {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }
);

export const expenseSplitTypeSchema = z.enum(['equal', 'exact', 'percentage', 'custom'], {
  errorMap: () => ({ message: 'Invalid split type' }),
});

export const expenseSplitSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().positive('Amount must be positive').optional(),
  percentage: z.number().min(0).max(100).optional(),
});

export const createExpenseSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description is too long'),
  amount: amountSchema,
  currency: currencyCodeSchema,
  paidBy: z.string().min(1, 'Payer is required'),
  category: expenseCategorySchema,
  date: z.coerce.date(),
  splitType: expenseSplitTypeSchema,
  splits: z.array(expenseSplitSchema).optional(),
  receiptUrl: z.string().url().max(2048).nullable().optional(),
  notes: z.string().max(1000, 'Notes are too long').nullable().optional(),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(3).max(500).optional(),
  amount: amountSchema.optional(),
  currency: currencyCodeSchema.optional(),
  category: expenseCategorySchema.optional(),
  date: z.coerce.date().optional(),
  splitType: expenseSplitTypeSchema.optional(),
  splits: z.array(expenseSplitSchema).optional(),
  receiptUrl: z.string().url().max(2048).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

/**
 * Settlement validation schemas
 */
export const createSettlementSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  fromUserId: z.string().min(1, 'From user ID is required'),
  toUserId: z.string().min(1, 'To user ID is required'),
  amount: amountSchema,
}).refine((data) => data.fromUserId !== data.toUserId, {
  message: 'From user and to user cannot be the same',
  path: ['toUserId'],
});

export const updateSettlementSchema = z.object({
  amount: amountSchema.optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
});

/**
 * Pagination validation schemas
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * ID validation
 */
export const idSchema = z.string().min(1, 'ID is required');

/**
 * Query validation schemas
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query is too long'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  maxSize: z.number().positive().default(5242880), // 5MB in bytes
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
});

export const validateFile = (
  file: File,
  options: z.infer<typeof fileUploadSchema>
): { valid: boolean; error?: string } => {
  if (file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${options.maxSize / 1024 / 1024}MB`,
    };
  }

  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
};

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine((data) => data.from <= data.to, {
  message: 'Start date must be before end date',
  path: ['to'],
});

/**
 * Export all schema types
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type UpdateSettlementInput = z.infer<typeof updateSettlementSchema>;
