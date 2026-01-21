import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Type Safety Tests
 *
 * This file validates the core type definitions used throughout the SplitSync app.
 * It ensures Zod schemas match TypeScript interfaces and validates data transformations.
 */

// ==================== Core Type Definitions ====================

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  createdBy: string;
  createdAt: Date;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number; // Stored in cents/lowest currency unit
  description: string;
  date: Date;
  createdAt: Date;
}

export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // The exact amount this person owes
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  settledAt: Date;
}

// ==================== Zod Validation Schemas ====================

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  image: z.string().url().nullable().optional(),
  createdAt: z.date(),
});

export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, "Group name must be at least 3 characters").max(100),
  currency: z.string().default("USD"),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
});

export const GroupMemberSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["ADMIN", "MEMBER"]),
  joinedAt: z.date(),
});

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  payerId: z.string().uuid(),
  amount: z
    .number()
    .int()
    .positive("Amount must be positive")
    .min(1, "Amount must be at least 1 cent"),
  description: z.string().min(1).max(500),
  date: z.date(),
  createdAt: z.date(),
});

export const ExpenseSplitSchema = z.object({
  expenseId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z
    .number()
    .int()
    .nonnegative("Split amount cannot be negative"),
});

export const SettlementSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.number().int().positive("Settlement amount must be positive"),
  settledAt: z.date(),
});

// ==================== Helper Functions ====================

/**
 * Converts a float amount to integer cents (e.g., $10.50 -> 1050)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts integer cents to float amount (e.g., 1050 -> $10.50)
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Formats cents as currency string
 */
export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(fromCents(cents));
}

/**
 * Validates that expense splits sum to the total expense amount
 */
export function validateExpenseSplits(
  expenseAmount: number,
  splits: Array<{ amount: number }>
): boolean {
  const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
  return totalSplits === expenseAmount;
}

// ==================== Tests ====================

describe("Type Definitions and Validation", () => {
  describe("User Schema", () => {
    it("should validate a valid user object", () => {
      const validUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
        createdAt: new Date(),
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "not-an-email",
        createdAt: new Date(),
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const invalidUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "",
        email: "john@example.com",
        createdAt: new Date(),
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe("Group Schema", () => {
    it("should validate a valid group object", () => {
      const validGroup = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Trip to Paris",
        currency: "USD",
        createdBy: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
      };

      const result = GroupSchema.safeParse(validGroup);
      expect(result.success).toBe(true);
    });

    it("should reject group name shorter than 3 characters", () => {
      const invalidGroup = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "AB",
        currency: "USD",
        createdBy: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
      };

      const result = GroupSchema.safeParse(invalidGroup);
      expect(result.success).toBe(false);
    });

    it("should default currency to USD", () => {
      const groupWithoutCurrency = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Trip to Paris",
        createdBy: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
      };

      const result = GroupSchema.safeParse(groupWithoutCurrency);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("USD");
      }
    });
  });

  describe("Expense Schema", () => {
    it("should validate a valid expense object", () => {
      const validExpense = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        groupId: "550e8400-e29b-41d4-a716-446655440000",
        payerId: "550e8400-e29b-41d4-a716-446655440000",
        amount: 1050, // $10.50 in cents
        description: "Dinner at restaurant",
        date: new Date(),
        createdAt: new Date(),
      };

      const result = ExpenseSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
    });

    it("should reject negative amounts", () => {
      const invalidExpense = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        groupId: "550e8400-e29b-41d4-a716-446655440000",
        payerId: "550e8400-e29b-41d4-a716-446655440000",
        amount: -100,
        description: "Invalid expense",
        date: new Date(),
        createdAt: new Date(),
      };

      const result = ExpenseSchema.safeParse(invalidExpense);
      expect(result.success).toBe(false);
    });

    it("should reject zero amounts", () => {
      const invalidExpense = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        groupId: "550e8400-e29b-41d4-a716-446655440000",
        payerId: "550e8400-e29b-41d4-a716-446655440000",
        amount: 0,
        description: "Zero expense",
        date: new Date(),
        createdAt: new Date(),
      };

      const result = ExpenseSchema.safeParse(invalidExpense);
      expect(result.success).toBe(false);
    });

    it("should reject decimal (float) amounts - must be integer cents", () => {
      const invalidExpense = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        groupId: "550e8400-e29b-41d4-a716-446655440000",
        payerId: "550e8400-e29b-41d4-a716-446655440000",
        amount: 10.5,
        description: "Invalid decimal amount",
        date: new Date(),
        createdAt: new Date(),
      };

      const result = ExpenseSchema.safeParse(invalidExpense);
      expect(result.success).toBe(false);
    });
  });

  describe("Settlement Schema", () => {
    it("should validate a valid settlement object", () => {
      const validSettlement = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        groupId: "550e8400-e29b-41d4-a716-446655440000",
        fromUserId: "550e8400-e29b-41d4-a716-446655440001",
        toUserId: "550e8400-e29b-41d4-a716-446655440002",
        amount: 5000, // $50.00
        settledAt: new Date(),
      };

      const result = SettlementSchema.safeParse(validSettlement);
      expect(result.success).toBe(true);
    });

    it("should reject negative settlement amounts", () => {
      const invalidSettlement = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        groupId: "550e8400-e29b-41d4-a716-446655440000",
        fromUserId: "550e8400-e29b-41d4-a716-446655440001",
        toUserId: "550e8400-e29b-41d4-a716-446655440002",
        amount: -1000,
        settledAt: new Date(),
      };

      const result = SettlementSchema.safeParse(invalidSettlement);
      expect(result.success).toBe(false);
    });
  });
});

describe("Currency Helper Functions", () => {
  describe("toCents", () => {
    it("should convert dollar amount to cents", () => {
      expect(toCents(10.50)).toBe(1050);
      expect(toCents(100)).toBe(10000);
      expect(toCents(0.99)).toBe(99);
    });

    it("should handle rounding correctly", () => {
      expect(toCents(10.555)).toBe(1056);
      expect(toCents(10.554)).toBe(1055);
    });
  });

  describe("fromCents", () => {
    it("should convert cents to dollar amount", () => {
      expect(fromCents(1050)).toBe(10.50);
      expect(fromCents(10000)).toBe(100);
      expect(fromCents(99)).toBe(0.99);
    });
  });

  describe("formatCurrency", () => {
    it("should format cents as currency string", () => {
      expect(formatCurrency(1050, "USD")).toBe("$10.50");
      expect(formatCurrency(10000, "USD")).toBe("$100.00");
      expect(formatCurrency(99, "USD")).toBe("$0.99");
    });

    it("should handle zero amount", () => {
      expect(formatCurrency(0, "USD")).toBe("$0.00");
    });
  });
});

describe("Expense Split Validation", () => {
  it("should validate correct splits that sum to total", () => {
    const expenseAmount = 10000; // $100.00
    const splits = [
      { amount: 3334 },
      { amount: 3333 },
      { amount: 3333 },
    ];

    expect(validateExpenseSplits(expenseAmount, splits)).toBe(true);
  });

  it("should reject splits that don't sum to total", () => {
    const expenseAmount = 10000; // $100.00
    const splits = [
      { amount: 3300 },
      { amount: 3300 },
      { amount: 3300 },
    ];

    expect(validateExpenseSplits(expenseAmount, splits)).toBe(false);
  });

  it("should handle even splits correctly", () => {
    const expenseAmount = 6000; // $60.00
    const splits = [
      { amount: 2000 },
      { amount: 2000 },
      { amount: 2000 },
    ];

    expect(validateExpenseSplits(expenseAmount, splits)).toBe(true);
  });

  it("should validate single person expense", () => {
    const expenseAmount = 5000; // $50.00
    const splits = [{ amount: 5000 }];

    expect(validateExpenseSplits(expenseAmount, splits)).toBe(true);
  });

  it("should reject negative split amounts", () => {
    const expenseAmount = 5000;
    const splits = [
      { amount: 6000 },
      { amount: -1000 },
    ];

    expect(validateExpenseSplits(expenseAmount, splits)).toBe(false);
  });
});
