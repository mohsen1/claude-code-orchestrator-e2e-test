import { z } from "zod";

/**
 * Schema for creating a new expense
 * Amount is stored in cents (integer) for precision
 */
export const createExpenseSchema = z.object({
  groupId: z.string().uuid("Invalid group ID"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  amount: z.number()
    .int("Amount must be in cents (integer)")
    .positive("Amount must be greater than 0")
    .max(100000000, "Amount is too large"),
  category: z.string()
    .max(100, "Category must be less than 100 characters")
    .optional(),
  paidById: z.string().uuid("Invalid payer ID"),
  splitType: z.enum(["EQUAL"], {
    errorMap: () => ({ message: "Split type must be EQUAL" }),
  }),
  date: z.coerce.date().optional().default(() => new Date()),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

/**
 * Schema for updating an expense
 */
export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.string().uuid("Invalid expense ID"),
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

/**
 * Schema for expense query parameters
 */
export const expenseQuerySchema = z.object({
  groupId: z.string().uuid("Invalid group ID"),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
