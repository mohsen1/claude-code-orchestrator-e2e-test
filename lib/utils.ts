import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a monetary amount in cents to a formatted currency string
 * @param cents - Amount in cents (integer)
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(cents: number, currency: string = "USD"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(dollars);
}

/**
 * Convert a currency string to cents (integer)
 * @param amount - Amount as a number (can be decimal)
 * @returns Amount in cents (integer)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Distribute an amount evenly among multiple people, ensuring
 * the sum equals the original amount (handles remainders)
 * @param totalCents - Total amount in cents
 * @param numPeople - Number of people to split among
 * @returns Array of amounts in cents for each person
 */
export function distributeEvenly(totalCents: number, numPeople: number): number[] {
  if (numPeople <= 0) throw new Error("Number of people must be greater than 0");

  const baseAmount = Math.floor(totalCents / numPeople);
  const remainder = totalCents % numPeople;

  const distribution = Array(numPeople).fill(baseAmount);

  // Distribute remainder pennies to the first 'remainder' people
  for (let i = 0; i < remainder; i++) {
    distribution[i] += 1;
  }

  return distribution;
}
