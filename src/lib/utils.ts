import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 * @param amount - Amount in cents/lowest unit
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Convert from cents to dollars
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Parse currency string to amount in cents
 * @param value - Currency string (e.g., "10.50")
 * @returns Amount in cents (e.g., 1050)
 */
export function parseCurrency(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error('Invalid currency value');
  }
  return Math.round(parsed * 100);
}

/**
 * Split amount evenly among n people, handling remainder distribution
 * @param totalAmount - Total amount in cents
 * @param numPeople - Number of people to split between
 * @returns Array of amounts in cents
 */
export function splitAmountEvenly(totalAmount: number, numPeople: number): number[] {
  if (numPeople <= 0) {
    throw new Error('Number of people must be greater than 0');
  }

  const baseAmount = Math.floor(totalAmount / numPeople);
  const remainder = totalAmount % numPeople;

  // Distribute remainder penny-by-penny
  const amounts = Array(numPeople).fill(baseAmount);
  for (let i = 0; i < remainder; i++) {
    amounts[i] += 1;
  }

  return amounts;
}

/**
 * Generate a random UUID
 * @returns UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
