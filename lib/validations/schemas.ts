import { z } from 'zod';

/**
 * Common validation schemas using Zod
 * These schemas provide runtime validation for API endpoints and forms
 */

/**
 * Entity ID validation (UUID or nanoid)
 */
export const entityIdSchema = z.string().min(1).max(50);

/**
 * Email validation with strict rules
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email too short')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

/**
 * Name validation (user names, group names, etc.)
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim();

/**
 * Money validation (cents as integer)
 * All monetary values are stored as integers representing cents
 */
export const moneyCentsSchema = z
  .number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  })
  .int('Amount must be in whole cents')
  .min(0, 'Amount cannot be negative')
  .max(9_999_999_99, 'Amount exceeds maximum');

/**
 * Date/datetime validation
 */
export const dateTimeSchema = z.string().datetime('Invalid datetime format');

/**
 * Pagination parameters validation
 */
export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

/**
 * URL validation
 */
export const urlSchema = z.string().url('Invalid URL format');

/**
 * Group creation validation schema
 */
export const createGroupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  currency: z.string().length(3).default('USD'),
});

/**
 * Expense creation validation schema
 */
export const createExpenseSchema = z.object({
  groupId: entityIdSchema,
  description: z.string().min(1).max(500).trim(),
  amount: moneyCentsSchema,
  payerId: entityIdSchema,
  category: z.enum([
    'FOOD',
    'TRANSPORT',
    'ACCOMMODATION',
    'ENTERTAINMENT',
    'SHOPPING',
    'UTILITIES',
    'OTHER',
  ]).default('OTHER'),
  date: dateTimeSchema.optional().default(() => new Date().toISOString()),
  receiptUrl: urlSchema.optional(),
});

/**
 * Settlement creation validation schema
 */
export const createSettlementSchema = z.object({
  groupId: entityIdSchema,
  fromUserId: entityIdSchema,
  toUserId: entityIdSchema,
  amount: moneyCentsSchema,
  description: z.string().max(500).optional(),
});

/**
 * Invite link validation schema
 */
export const inviteLinkSchema = z.object({
  token: z.string().min(20).max(100),
  expiresAt: dateTimeSchema.optional(),
  maxUses: z.number().int().min(1).optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type PaginationParams = z.infer<typeof paginationParamsSchema>;
