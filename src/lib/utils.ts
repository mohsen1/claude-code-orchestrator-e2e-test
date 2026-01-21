import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in cents to currency string
 * @param amount - Amount in cents (integer)
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  const dollars = amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(dollars);
}

/**
 * Convert currency string to amount in cents
 * @param value - Currency string (e.g., "10.50")
 * @returns Amount in cents (integer)
 */
export function currencyToCents(value: string): number {
  const dollars = parseFloat(value);
  if (isNaN(dollars)) {
    throw new Error("Invalid currency value");
  }
  return Math.round(dollars * 100);
}

/**
 * Split an amount (in cents) among N people, distributing remainder pennies
 * @param totalAmount - Total amount in cents
 * @param numPeople - Number of people to split among
 * @returns Array of amounts in cents
 */
export function splitAmount(totalAmount: number, numPeople: number): number[] {
  if (numPeople <= 0) {
    throw new Error("Number of people must be greater than 0");
  }
  if (totalAmount < 0) {
    throw new Error("Total amount cannot be negative");
  }

  const baseAmount = Math.floor(totalAmount / numPeople);
  const remainder = totalAmount % numPeople;

  const splits = Array(numPeople).fill(baseAmount);

  // Distribute remainder pennies to first N people
  for (let i = 0; i < remainder; i++) {
    splits[i] += 1;
  }

  return splits;
}

/**
 * Calculate net balances for users in a group
 * @param expenses - All expenses with their splits
 * @param settlements - All recorded settlements
 * @returns Map of userId to net balance (positive = owed money, negative = owes)
 */
export function calculateNetBalances(
  expenses: Array<{ payerId: string; amount: number; splits: Array<{ userId: string; amount: number }> }>,
  settlements: Array<{ fromUserId: string; toUserId: string; amount: number }>
): Map<string, number> {
  const balances = new Map<string, number>();

  // Process expenses
  for (const expense of expenses) {
    // Payer paid the full amount (they are owed this much)
    const payerBalance = balances.get(expense.payerId) || 0;
    balances.set(expense.payerId, payerBalance + expense.amount);

    // Each split person owes their portion
    for (const split of expense.splits) {
      const splitBalance = balances.get(split.userId) || 0;
      balances.set(split.userId, splitBalance - split.amount);
    }
  }

  // Process settlements
  for (const settlement of settlements) {
    // From person paid money (their balance improves)
    const fromBalance = balances.get(settlement.fromUserId) || 0;
    balances.set(settlement.fromUserId, fromBalance + settlement.amount);

    // To person received money (their balance decreases)
    const toBalance = balances.get(settlement.toUserId) || 0;
    balances.set(settlement.toUserId, toBalance - settlement.amount);
  }

  return balances;
}
