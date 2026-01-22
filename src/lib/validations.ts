/**
 * Zod validation schemas for SplitSync application
 * Runtime type validation for all API inputs and forms
 */

import { z } from 'zod';

// =============================================================================
// COMMON VALIDATIONS
// =============================================================================

export const currencyCodeSchema = z
  .string()
  .length(3)
  .toUpperCase()
  .refine((code) => {
    // Basic validation for common currency codes
    const commonCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'];
    return commonCurrencies.includes(code);
  }, 'Invalid currency code');

export const positiveIntegerSchema = z.number().int().positive().safe();

export const monetaryAmountSchema = z
  .number()
  .finite()
  .nonnegative()
  .refine((val) => Number.isInteger(val * 100), {
    message: 'Amount must have at most 2 decimal places',
  });

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const uuidSchema = z.string().uuid('Invalid ID format');

export const urlSchema = z.string().url('Invalid URL');

export const dateSchema = z.coerce.date().refine((date) => !isNaN(date.getTime()), {
  message: 'Invalid date',
});

// =============================================================================
// USER VALIDATIONS
// =============================================================================

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional().nullable(),
  defaultCurrency: currencyCodeSchema.optional(),
});

export const notificationPreferencesSchema = z.object({
  emailOnExpenseAdded: z.boolean().default(true),
  emailOnSettlementDue: z.boolean().default(true),
  emailOnInviteAccepted: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  weeklySummary: z.boolean().default(false),
});

// =============================================================================
// GROUP VALIDATIONS
// =============================================================================

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, 'Group name must be at least 2 characters')
    .max(100, 'Group name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  currency: currencyCodeSchema.default('USD'),
});

export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .trim()
    .optional(),
  description: z.string().max(500).optional().nullable(),
  currency: currencyCodeSchema.optional(),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  expiresIn: z
    .number()
    .int()
    .positive()
    .max(168, 'Invite cannot expire more than 168 hours (7 days) from now')
    .default(24)
    .optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member'], {
    required_error: 'Role is required',
  }),
});

// =============================================================================
// EXPENSE VALIDATIONS
// =============================================================================

export const expenseCategoryEnum = z.enum([
  'food',
  'transport',
  'accommodation',
  'entertainment',
  'utilities',
  'shopping',
  'health',
  'other',
]);

export const createExpenseSchema = z.object({
  groupId: uuidSchema,
  amount: monetaryAmountSchema.refine((val) => val > 0, {
    message: 'Amount must be greater than 0',
  }),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  category: expenseCategoryEnum.optional().default('other'),
  date: dateSchema.default(() => new Date()),
  receiptUrl: z.string().url().optional().nullable(),
  splitType: z.enum(['equal', 'custom', 'percentage']).default('equal'),
  splits: z
    .array(
      z.object({
        userId: uuidSchema,
        amount: monetaryAmountSchema.optional(),
        percentage: z.number().min(0).max(100).optional(),
      })
    )
    .min(1, 'At least one split is required')
    .optional(),
}).refine(
  (data) => {
    // Validate splits based on splitType
    if (data.splitType === 'custom' && data.splits) {
      // For custom splits, amounts must be provided
      return data.splits.every((split) => split.amount !== undefined);
    }
    if (data.splitType === 'percentage' && data.splits) {
      // For percentage splits, percentages must sum to 100
      const total = data.splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
      return Math.abs(total - 100) < 0.01; // Allow small floating point errors
    }
    return true;
  },
  {
    message: 'Invalid split data for the selected split type',
    path: ['splits'],
  }
);

export const updateExpenseSchema = z.object({
  amount: monetaryAmountSchema
    .refine((val) => val > 0, {
      message: 'Amount must be greater than 0',
    })
    .optional(),
  description: z
    .string()
    .min(3)
    .max(500)
    .trim()
    .optional(),
  category: expenseCategoryEnum.optional(),
  date: dateSchema.optional(),
  receiptUrl: z.string().url().optional().nullable(),
});

export const deleteExpenseSchema = z.object({
  expenseId: uuidSchema,
  reason: z.string().max(500).optional(),
});

// =============================================================================
// SETTLEMENT VALIDATIONS
// =============================================================================

export const createSettlementSchema = z.object({
  groupId: uuidSchema,
  fromUserId: uuidSchema,
  toUserId: uuidSchema,
  amount: monetaryAmountSchema.refine((val) => val > 0, {
    message: 'Amount must be greater than 0',
  }),
  notes: z.string().max(500).optional(),
});

export const updateSettlementSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']),
  completedAt: z.date().optional(),
});

// =============================================================================
// SETTLEMENT PLAN VALIDATIONS
// =============================================================================

export const generateSettlementPlanSchema = z.object({
  groupId: uuidSchema,
  options: z
    .object({
      minimizeTransactions: z.boolean().default(true),
      maxTransactions: z.number().int().positive().optional(),
      includePartialPayments: z.boolean().default(false),
    })
    .optional(),
});

// =============================================================================
// FILE UPLOAD VALIDATIONS
// =============================================================================

export const fileUploadSchema = z.object({
  fileName: z.string().max(255),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((val) => val > 0, 'File size must be greater than 0'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
});

export const receiptUploadSchema = z.object({
  groupId: uuidSchema,
  expenseId: uuidSchema.optional(),
  file: z.any(),
});

// =============================================================================
// SEARCH & FILTER VALIDATIONS
// =============================================================================

export const expenseFilterSchema = z.object({
  groupId: uuidSchema,
  category: expenseCategoryEnum.optional(),
  payerId: uuidSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  minAmount: monetaryAmountSchema.optional(),
  maxAmount: monetaryAmountSchema.optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'description']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const settlementFilterSchema = z.object({
  groupId: uuidSchema,
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  userId: uuidSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

// =============================================================================
// PAGINATION VALIDATIONS
// =============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
  cursor: z.string().optional(),
});

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    hasMore: z.boolean(),
  });

// =============================================================================
// API RESPONSE VALIDATIONS
// =============================================================================

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.unknown()).optional(),
      })
      .optional(),
    meta: z
      .object({
        timestamp: z.string(),
        requestId: z.string(),
      })
      .optional(),
  });

// =============================================================================
// REAL-TIME EVENT VALIDATIONS
// =============================================================================

export const socketEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('expense:created'),
    data: z.object({
      expenseId: uuidSchema,
      groupId: uuidSchema,
      amount: monetaryAmountSchema,
    }),
  }),
  z.object({
    type: z.literal('expense:updated'),
    data: z.object({
      expenseId: uuidSchema,
      groupId: uuidSchema,
    }),
  }),
  z.object({
    type: z.literal('expense:deleted'),
    data: z.object({
      expenseId: uuidSchema,
      groupId: uuidSchema,
    }),
  }),
  z.object({
    type: z.literal('settlement:created'),
    data: z.object({
      settlementId: uuidSchema,
      groupId: uuidSchema,
      fromUserId: uuidSchema,
      toUserId: uuidSchema,
      amount: monetaryAmountSchema,
    }),
  }),
  z.object({
    type: z.literal('settlement:completed'),
    data: z.object({
      settlementId: uuidSchema,
      groupId: uuidSchema,
    }),
  }),
  z.object({
    type: z.literal('member:joined'),
    data: z.object({
      groupId: uuidSchema,
      userId: uuidSchema,
    }),
  }),
  z.object({
    type: z.literal('member:left'),
    data: z.object({
      groupId: uuidSchema,
      userId: uuidSchema,
    }),
  }),
  z.object({
    type: z.literal('balance:updated'),
    data: z.object({
      groupId: uuidSchema,
      userId: uuidSchema,
      balance: z.number(),
    }),
  }),
]);

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>;
export type SettlementFilterInput = z.infer<typeof settlementFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
