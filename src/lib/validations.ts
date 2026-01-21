import { z } from "zod";

/**
 * Schema for creating a new group
 */
export const createGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters").max(100),
  currency: z.string().default("USD").optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

/**
 * Schema for creating a new expense
 */
export const createExpenseSchema = z.object({
  groupId: z.string().uuid("Invalid group ID"),
  payerId: z.string().uuid("Invalid payer ID"),
  amount: z.number().positive("Amount must be positive").int("Amount must be in cents"),
  description: z.string().min(1, "Description is required").max(500),
  date: z.date().optional().default(() => new Date()),
  splitType: z.enum(["EQUAL", "CUSTOM"]).default("EQUAL"),
  splits: z.array(z.object({
    userId: z.string().uuid(),
    amount: z.number().int().min(0),
  })).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

/**
 * Schema for recording a settlement
 */
export const createSettlementSchema = z.object({
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.number().positive("Amount must be positive").int("Amount must be in cents"),
  date: z.date().optional().default(() => new Date()),
  notes: z.string().max(500).optional(),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for inviting a user to a group
 */
export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleId: z.string().uuid().optional(),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
