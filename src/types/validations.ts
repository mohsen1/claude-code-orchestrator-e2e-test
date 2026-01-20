import { z } from "zod";

/**
 * Common Validation Schemas
 */

/**
 * UUID Validation
 * Validates standard UUID format
 */
export const uuidSchema = z.string().uuid("Invalid ID format");

/**
 * Email Validation
 * Validates email format
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .toLowerCase()
  .trim();

/**
 * Password Validation
 * Enforces strong password requirements
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Money Amount Validation
 * Validates monetary amounts in cents (integer format)
 * Example: $10.50 = 1050 cents
 */
export const amountInCentsSchema = z
  .number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  })
  .int("Amount must be in whole cents")
  .min(1, "Amount must be at least 1 cent")
  .max(99999999, "Amount is too large");

/**
 * Currency Code Validation
 * Validates ISO 4217 currency codes (e.g., USD, EUR, GBP)
 */
export const currencySchema = z
  .string()
  .length(3, "Currency code must be 3 characters")
  .uppercase()
  .refine((val) => /^[A-Z]{3}$/.test(val), {
    message: "Invalid currency code format",
  });

/**
 * Date Validation
 * Accepts ISO date strings or Date objects
 */
export const dateSchema = z.coerce.date({
  required_error: "Date is required",
  invalid_type_error: "Invalid date format",
});

/**
 * User Validation Schemas
 */

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim()
    .optional(),
  image: z.string().url("Invalid image URL").optional(),
});

/**
 * Group Validation Schemas
 */

/**
 * Schema for creating a new group
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .max(100, "Group name is too long")
    .trim(),
  currency: currencySchema.default("USD"),
});

/**
 * Schema for updating a group
 */
export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .max(100, "Group name is too long")
    .trim()
    .optional(),
  currency: currencySchema.optional(),
});

/**
 * Schema for adding a member to a group
 */
export const addGroupMemberSchema = z.object({
  groupId: uuidSchema,
  userId: uuidSchema,
  role: z.enum(["admin", "member"]).default("member"),
});

/**
 * Schema for updating member role
 */
export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

/**
 * Expense Validation Schemas
 */

/**
 * Schema for creating an expense
 * Amount should be provided in cents (integer)
 */
export const createExpenseSchema = z.object({
  groupId: uuidSchema,
  payerId: uuidSchema,
  amount: amountInCentsSchema,
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long")
    .trim(),
  date: dateSchema.optional(),
  splits: z
    .array(
      z.object({
        userId: uuidSchema,
        amount: amountInCentsSchema,
      })
    )
    .min(1, "At least one split is required")
    .refine(
      (splits) => {
        // Ensure all userIds are unique
        const userIds = splits.map((s) => s.userId);
        return new Set(userIds).size === userIds.length;
      },
      {
        message: "Each user can only appear once in splits",
      }
    )
    .optional(),
});

/**
 * Schema for updating an expense
 */
export const updateExpenseSchema = z.object({
  amount: amountInCentsSchema.optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long")
    .trim()
    .optional(),
  date: dateSchema.optional(),
});

/**
 * Settlement Validation Schemas
 */

/**
 * Schema for recording a settlement payment
 */
export const createSettlementSchema = z.object({
  groupId: uuidSchema,
  fromUserId: uuidSchema,
  toUserId: uuidSchema,
  amount: amountInCentsSchema,
});

/**
 * Schema for bulk creating settlements (simplified debts)
 */
export const createBulkSettlementsSchema = z.array(
  z.object({
    fromUserId: uuidSchema,
    toUserId: uuidSchema,
    amount: amountInCentsSchema,
  })
);

/**
 * API Route Validation Schemas
 */

/**
 * Schema for validating query parameters in list requests
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for validating UUID route parameters
 */
export const paramsWithIdSchema = z.object({
  id: uuidSchema,
});

/**
 * Type Exports
 * Export TypeScript types inferred from Zod schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type CreateBulkSettlementsInput = z.infer<typeof createBulkSettlementsSchema>;

export type ListQueryInput = z.infer<typeof listQuerySchema>;
export type ParamsWithId = z.infer<typeof paramsWithIdSchema>;
