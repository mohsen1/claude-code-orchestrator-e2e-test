import { z } from "zod";

/**
 * User schema validation
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  image: z.string().url().nullable().optional(),
});

/**
 * Group schema validation
 */
export const groupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Group name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  inviteCode: z.string().min(6).max(20),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createGroupSchema = groupSchema.extend({
  name: z.string().min(2, "Group name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

export const updateGroupSchema = groupSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Expense schema validation (amount in cents)
 */
export const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
  amount: z.number().int().positive("Amount must be positive"),
  paidBy: z.string().uuid(),
  date: z.date().optional(),
  createdAt: z.date().optional(),
});

export const createExpenseSchema = expenseSchema.extend({
  amount: z
    .number({
      required_error: "Amount is required",
    })
    .positive("Amount must be positive")
    .int("Amount must be a whole number"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
  paidBy: z.string().uuid("Invalid payer ID"),
  date: z.date().optional(),
});

export const updateExpenseSchema = expenseSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Expense split validation
 */
export const expenseSplitSchema = z.object({
  id: z.string().uuid().optional(),
  expenseId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().int().positive("Split amount must be positive"),
});

/**
 * Group member validation
 */
export const groupMemberSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["member", "admin"]).default("member"),
  joinedAt: z.date().optional(),
});

export const addMemberSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["member", "admin"]).default("member"),
});

/**
 * Settlement validation
 */
export const settlementSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.number().int().positive("Amount must be positive"),
  settledAt: z.date().optional(),
  createdAt: z.date().optional(),
});

export const createSettlementSchema = z.object({
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z
    .number({
      required_error: "Amount is required",
    })
    .positive("Amount must be positive")
    .int("Amount must be a whole number"),
});

/**
 * Invite code validation
 */
export const joinGroupSchema = z.object({
  inviteCode: z
    .string()
    .min(6, "Invalid invite code")
    .max(20, "Invalid invite code"),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Group = z.infer<typeof groupSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type UpdateGroup = z.infer<typeof updateGroupSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type CreateExpense = z.infer<typeof createExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;
export type ExpenseSplit = z.infer<typeof expenseSplitSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;
export type Settlement = z.infer<typeof settlementSchema>;
export type CreateSettlement = z.infer<typeof createSettlementSchema>;
export type JoinGroup = z.infer<typeof joinGroupSchema>;
