import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Uses clsx for conditional class construction and tailwind-merge for deduplication
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged class string with Tailwind optimizations
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency (USD by default)
 * Handles integer cents to dollars conversion safely
 *
 * @param amountInCents - Amount in cents (integer)
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amountInCents: number, currency = 'USD'): string {
  if (typeof amountInCents !== 'number' || Number.isNaN(amountInCents)) {
    throw new Error('amountInCents must be a valid number');
  }

  const dollars = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Convert dollars to cents safely without floating-point issues
 *
 * @param dollars - Amount in dollars (can be decimal)
 * @returns Amount in cents (integer)
 */
export function dollarsToCents(dollars: number): number {
  if (typeof dollars !== 'number' || Number.isNaN(dollars)) {
    throw new Error('dollars must be a valid number');
  }
  return Math.round(dollars * 100);
}

/**
 * Format a date using date-fns with consistent options
 *
 * @param date - Date to format
 * @param format - Format string (default: 'PPP' = "Jan 1, 2026")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format = 'PPP'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  // Will be implemented with date-fns in actual usage
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Generate a random ID string (for client-side ID generation)
 * Uses crypto API for better randomness than Math.random()
 *
 * @param length - Length of the ID to generate (default: 16)
 * @returns Random alphanumeric string
 */
export function generateId(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Safe JSON parse with fallback
 *
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce a function call
 *
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if code is running on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if code is running on the server side
 */
export const isServer = !isClient;
