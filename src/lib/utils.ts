import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Calculate total balance for a user in a group
 */
export function calculateBalance(
  userId: string,
  expenses: Array<{
    paidBy: string;
    amount: number;
    splitAmong: string[];
  }>
): number {
  let balance = 0;

  expenses.forEach((expense) => {
    const userIndex = expense.splitAmong.indexOf(userId);
    const isUserInSplit = userIndex !== -1;

    if (expense.paidBy === userId) {
      // User paid this expense
      balance += expense.amount;
      // Subtract their share
      if (isUserInSplit) {
        balance -= expense.amount / expense.splitAmong.length;
      }
    } else if (isUserInSplit) {
      // User owes their share
      balance -= expense.amount / expense.splitAmong.length;
    }
  });

  return balance;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
