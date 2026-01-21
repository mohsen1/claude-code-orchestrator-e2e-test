import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount in cents to display string
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

/**
 * Parse currency string to cents (integer)
 */
export function parseCurrencyToCents(amount: string): number {
  const dollars = parseFloat(amount);
  if (isNaN(dollars)) {
    throw new Error("Invalid currency amount");
  }
  return Math.round(dollars * 100);
}

/**
 * Generate a random invite code
 */
export function generateInviteCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate user's balance in a group (positive = owed money, negative = owes money)
 */
export function calculateUserBalance(
  userId: string,
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>
): number {
  let balance = 0;

  for (const expense of expenses) {
    if (expense.paidBy === userId) {
      // User paid for this expense
      balance += expense.amount;
    }

    // Subtract user's share
    const userSplit = expense.splits.find((split) => split.userId === userId);
    if (userSplit) {
      balance -= userSplit.amount;
    }
  }

  return balance;
}
