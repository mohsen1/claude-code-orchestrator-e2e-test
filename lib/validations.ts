import { z } from "zod";

/**
 * Schema for validating user input when creating a group
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Group name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  currency: z
    .string()
    .min(3, "Currency code must be 3 characters")
    .max(3, "Currency code must be 3 characters")
    .default("USD"),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

/**
 * Schema for validating expense creation
 */
export const createExpenseSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be less than 200 characters")
    .trim(),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100000000, "Amount is too large"), // Max $1M in cents
  amountInCents: z
    .number()
    .int("Amount must be in whole cents")
    .positive("Amount must be positive")
    .max(10000000000, "Amount is too large"),
  payerId: z.string().uuid("Invalid payer ID"),
  groupId: z.string().uuid("Invalid group ID"),
  category: z
    .string()
    .max(50, "Category must be less than 50 characters")
    .optional(),
  date: z.coerce.date().optional(),
  splitType: z.enum(["EQUAL", "CUSTOM", "PERCENTAGE"]).default("EQUAL"),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

/**
 * Schema for validating settlement records
 */
export const createSettlementSchema = z.object({
  fromUserId: z.string().uuid("Invalid sender user ID"),
  toUserId: z.string().uuid("Invalid recipient user ID"),
  amount: z
    .number()
    .int("Amount must be in whole cents")
    .positive("Amount must be positive"),
  groupId: z.string().uuid("Invalid group ID"),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email is too short")
    .max(255, "Email is too long")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for inviting users to a group
 */
export const inviteUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  groupId: z.string().uuid("Invalid group ID"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  expiresIn: z
    .number()
    .positive("Expiration must be positive")
    .max(8760, "Expiration cannot exceed 1 year (8760 hours)")
    .default(168), // Default 7 days
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
