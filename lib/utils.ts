import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for Tailwind conflict resolution
 *
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class string with Tailwind classes properly deduplicated
 *
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-4 overrides px-2)
 * cn('text-red-500', someCondition && 'text-blue-500') // Conditionally merges
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a monetary amount in cents to a display string with currency symbol
 *
 * @param amountInCents - Amount in cents (integer)
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(12500) // Returns "$125.00"
 * formatCurrency(99, 'EUR') // Returns "€0.99"
 */
export function formatCurrency(amountInCents: number, currency: string = 'USD'): string {
  const amountInDollars = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInDollars);
}

/**
 * Format a date to a localized string
 *
 * @param date - Date to format (Date object or ISO string)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Calculate the optimal settlement between group members to minimize transactions
 * Uses a debt simplification algorithm
 *
 * @param balances - Map of user ID to their balance (positive = owed money, negative = owes)
 * @returns Array of settlement objects with from, to, and amount
 *
 * @example
 * calculateSettlements(new Map([['user1', 100], ['user2', -50], ['user3', -50]]))
 * // Returns [{ from: 'user2', to: 'user1', amount: 50 }, { from: 'user3', to: 'user1', amount: 50 }]
 */
export function calculateSettlements(
  balances: Map<string, number>
): Array<{ from: string; to: string; amount: number }> {
  const settlements: Array<{ from: string; to: string; amount: number }> = [];

  // Separate debtors and creditors
  const debtors: Array<{ userId: string; amount: number }> = [];
  const creditors: Array<{ userId: string; amount: number }> = [];

  balances.forEach((balance, userId) => {
    if (balance < -0.01) { // Floating point tolerance
      debtors.push({ userId, amount: -balance });
    } else if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    }
  });

  // Sort by amount (largest first) for optimal matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Match debtors to creditors
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    if (settlementAmount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimal places
      });
    }

    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    if (debtor.amount < 0.01) debtorIndex++;
    if (creditor.amount < 0.01) creditorIndex++;
  }

  return settlements;
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a unique ID
 * @returns Unique identifier string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
