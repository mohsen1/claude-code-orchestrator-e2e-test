/**
 * SplitSync Utility Library
 *
 * This module contains shared utility functions and configurations
 * used throughout the SplitSync application.
 */

/**
 * Format an amount in cents to a currency string
 * @param amount - Amount in cents (integer)
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Validate amount is an integer
  if (!Number.isInteger(amount)) {
    throw new Error('Amount must be an integer representing cents');
  }

  // Validate currency is supported
  if (!SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) {
    throw new Error(`Unsupported currency code: ${currency}. Supported currencies are: ${SUPPORTED_CURRENCIES.join(', ')}`);
  }

  // Divide by 100 to get dollars
  const dollars = amount / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Convert a decimal amount to cents (integer)
 * @param amount - Amount in dollars (decimal)
 * @returns Amount in cents (integer)
 */
export function toCents(amount: number): number {
  // Round to handle floating point precision issues
  return Math.round(amount * 100);
}

/**
 * Split an amount equally among a number of people
 * Ensures the sum of all splits equals the original amount
 * @param totalAmount - Total amount in cents
 * @param numPeople - Number of people to split between
 * @returns Array of amounts each person owes
 */
export function splitEqually(totalAmount: number, numPeople: number): number[] {
  if (numPeople <= 0) {
    throw new Error('Number of people must be greater than 0');
  }

  if (!Number.isInteger(numPeople)) {
    throw new Error('Number of people must be an integer');
  }

  if (!Number.isInteger(totalAmount)) {
    throw new Error('Total amount must be an integer');
  }

  if (totalAmount < 0) {
    throw new Error('Total amount must be non-negative');
  }

  // Base amount for each person
  const baseAmount = Math.floor(totalAmount / numPeople);
  const remainder = totalAmount % numPeople;

  // Distribute remainder pennies
  const splits = Array(numPeople).fill(baseAmount);
  for (let i = 0; i < remainder; i++) {
    splits[i] += 1;
  }

  return splits;
}

/**
 * Calculate the optimal settlement between users
 * @param balances - Object mapping user IDs to their balances
 * @returns Array of settlement objects showing who pays whom
 */
export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function calculateSettlements(
  balances: Record<string, number>
): Settlement[] {
  const settlements: Settlement[] = [];

  // Separate debtors and creditors
  const debtors: Array<{ userId: string; amount: number }> = [];
  const creditors: Array<{ userId: string; amount: number }> = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < 0) {
      debtors.push({ userId, amount: -balance });
    } else if (balance > 0) {
      creditors.push({ userId, amount: balance });
    }
  }

  // Sort by amount (largest first) for optimal matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Match debtors with creditors
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return settlements;
}

/**
 * Generate a random UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  // Handle non-positive lengths
  if (maxLength <= 0) return '';

  // If text already fits, return as-is
  if (text.length <= maxLength) return text;

  // For very small maxLength, truncate without ellipsis to respect maxLength
  if (maxLength <= 3) {
    return text.slice(0, maxLength);
  }

  // Reserve 3 characters for ellipsis
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Validate an email address
 * @param email - Email address to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Format a date to a localized string
 * @param date - Date to format
 * @param locale - Locale (default: en-US)
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Calculate the time ago from a date
 * @param date - Date to compare
 * @returns Relative time string (e.g., "2 hours ago")
 *
 * @note This function uses approximate interval values for calculations:
 * - Month: 30 days (2,592,000 seconds)
 * - Year: 365 days (31,536,000 seconds)
 *
 * These approximations may not match exact calendar periods. For example,
 * actual months vary from 28-31 days, and years can be 365 or 366 days.
 * For precise calendar-aware calculations, consider using a date library
 * like date-fns or dayjs.
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  // Approximate intervals (may not match exact calendar periods)
  const intervals = {
    year: 31536000,   // 365 days
    month: 2592000,   // 30 days
    week: 604800,     // 7 days
    day: 86400,       // 24 hours
    hour: 3600,       // 60 minutes
    minute: 60,       // 60 seconds
    second: 1,
  };

  // Past dates
  if (seconds >= 0) {
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  }

  // Future dates
  const absSeconds = Math.abs(seconds);
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(absSeconds / secondsInUnit);
    if (interval >= 1) {
      return `in ${interval} ${unit}${interval > 1 ? 's' : ''}`;
    }
  }

  return 'in a moment';
}

// Constants
export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'INR',
] as const;

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
};

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
