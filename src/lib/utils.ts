/**
 * Utility functions for SplitSync application
 * Includes string manipulation, formatting, money handling, and date utilities
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import type { Money, ExpenseCategory, SettlementStatus, GroupRole } from '@/types';

// ============================================================================
// CLASSNAME UTILITIES
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4'
 * cn('text-red-500', someCondition && 'text-blue-500') // conditional classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// MONEY UTILITIES
// ============================================================================

/**
 * Convert dollars to cents (integer)
 * All monetary values are stored as cents in the database
 *
 * @param dollars - Amount in dollars (can be decimal)
 * @returns Amount in cents (integer)
 *
 * @example
 * dollarsToCents(10.50) // 1050
 * dollarsToCents(100) // 10000
 */
export function dollarsToCents(dollars: number): Money {
  return Math.round(dollars * 100) as Money;
}

/**
 * Convert cents to dollars
 * Used for displaying monetary values to users
 *
 * @param cents - Amount in cents
 * @returns Amount in dollars
 *
 * @example
 * centsToDollars(1050) // 10.50
 * centsToDollars(10000) // 100.00
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format monetary value for display
 * Returns formatted string with currency symbol and proper decimal places
 *
 * @param cents - Amount in cents
 * @param currency - Currency code (default: 'USD')
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @returns Formatted monetary string
 *
 * @example
 * formatMoney(1050) // '$10.50'
 * formatMoney(10000) // '$100.00'
 * formatMoney(50) // '$0.50'
 * formatMoney(0, 'USD', false) // '0.00'
 */
export function formatMoney(
  cents: number,
  currency: string = 'USD',
  showSymbol: boolean = true
): string {
  const dollars = centsToDollars(cents);
  const formatted = dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showSymbol) {
    return currency === 'USD' ? `$${formatted}` : `${formatted} ${currency}`;
  }

  return formatted;
}

/**
 * Format monetary value with sign indicator
 * Shows + for positive (owed to user), - for negative (user owes)
 *
 * @param cents - Amount in cents
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted string with sign
 *
 * @example
 * formatMoneyWithSign(1050) // '+$10.50'
 * formatMoneyWithSign(-500) // '-$5.00'
 * formatMoneyWithSign(0) // '$0.00'
 */
export function formatMoneyWithSign(cents: number, currency: string = 'USD'): string {
  const sign = cents > 0 ? '+' : cents < 0 ? '' : '';
  const formatted = formatMoney(Math.abs(cents), currency, true);
  return `${sign}${formatted}`;
}

/**
 * Parse money string input to cents
 * Handles various input formats: "$10.50", "10.50", "10", etc.
 *
 * @param input - String input representing money
 * @returns Amount in cents
 * @throws Error if input is invalid
 *
 * @example
 * parseMoneyInput("$10.50") // 1050
 * parseMoneyInput("10.50") // 1050
 * parseMoneyInput("10") // 1000
 */
export function parseMoneyInput(input: string): Money {
  // Remove currency symbols and whitespace
  const cleaned = input.replace(/[$,\s]/g, '').trim();

  // Validate input
  if (!cleaned || !/^\d*\.?\d+$/.test(cleaned)) {
    throw new Error(`Invalid money format: ${input}`);
  }

  const dollars = parseFloat(cleaned);

  if (isNaN(dollars)) {
    throw new Error(`Invalid money format: ${input}`);
  }

  if (dollars < 0) {
    throw new Error('Money value cannot be negative');
  }

  return dollarsToCents(dollars);
}

/**
 * Calculate percentage of a total amount
 *
 * @param amount - Amount in cents
 * @param percentage - Percentage (0-100)
 * @returns Calculated amount in cents
 *
 * @example
 * calculatePercentage(10000, 25) // 2500 (25% of $100)
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return Math.round((amount * percentage) / 100);
}

/**
 * Split amount evenly among participants
 * Handles rounding errors by distributing remainder
 *
 * @param totalAmount - Total amount in cents
 * @param participantCount - Number of participants
 * @returns Array of amounts per participant in cents
 *
 * @example
 * splitEvenly(10000, 3) // [3334, 3333, 3333] (distributes remainder)
 * splitEvenly(10000, 4) // [2500, 2500, 2500, 2500]
 */
export function splitEvenly(totalAmount: number, participantCount: number): number[] {
  if (participantCount <= 0) {
    throw new Error('Participant count must be greater than 0');
  }

  const baseAmount = Math.floor(totalAmount / participantCount);
  const remainder = totalAmount % participantCount;

  const splits = Array(participantCount).fill(baseAmount);

  // Distribute remainder to first N participants
  for (let i = 0; i < remainder; i++) {
    splits[i]++;
  }

  return splits;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format date for display
 *
 * @param date - Date to format
 * @param formatStr - Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // 'Jan 22, 2026'
 * formatDate(new Date(), 'MM/dd/yyyy') // '01/22/2026'
 */
export function formatDate(date: Date, formatStr: string = 'MMM d, yyyy'): string {
  return format(date, formatStr);
}

/**
 * Format date with time
 *
 * @param date - Date to format
 * @returns Formatted date-time string
 *
 * @example
 * formatDateTime(new Date()) // 'Jan 22, 2026, 10:30 AM'
 */
export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy, h:mm a');
}

/**
 * Format date as relative time
 * Returns human-readable relative time string
 *
 * @param date - Date to format
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(new Date()) // 'just now'
 * formatRelativeTime(new Date(Date.now() - 3600000)) // 'about 1 hour ago'
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format date as short relative time
 * Returns compact relative time string
 *
 * @param date - Date to format
 * @returns Short relative time string
 *
 * @example
 * formatShortRelativeTime(new Date()) // 'now'
 * formatShortRelativeTime(new Date(Date.now() - 3600000)) // '1h'
 * formatShortRelativeTime(new Date(Date.now() - 86400000)) // '1d'
 */
export function formatShortRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w`;

  const diffInMonths = differenceInMonths(now, date);
  if (diffInMonths < 12) return `${diffInMonths}mo`;

  const diffInYears = differenceInYears(now, date);
  return `${diffInYears}y`;
}

/**
 * Check if date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is within last N days
 *
 * @param date - Date to check
 * @param days - Number of days
 * @returns True if date is within specified days
 */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const diffInDays = differenceInDays(now, date);
  return diffInDays >= 0 && diffInDays <= days;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate string to specified length with ellipsis
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 *
 * @example
 * truncate('Hello World', 5) // 'Hello...'
 * truncate('Hello World', 20) // 'Hello World'
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter of string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * capitalize('hello') // 'Hello'
 * capitalize('HELLO') // 'HELLO'
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 *
 * @param str - String to convert
 * @returns Title case string
 *
 * @example
 * toTitleCase('hello world') // 'Hello World'
 * toTitleCase('EXPENSE_CATEGORY') // 'Expense Category'
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Generate slug from string
 *
 * @param str - String to slugify
 * @returns Slug string
 *
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('Expense Category') // 'expense-category'
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate initials from name
 *
 * @param name - Full name
 * @param maxLength - Maximum number of initials (default: 2)
 * @returns Initials string
 *
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('John') // 'J'
 * getInitials('', 2) // ''
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);
  const initials = parts.map(part => part.charAt(0).toUpperCase());

  return initials.slice(0, maxLength).join('');
}

/**
 * Generate random string
 *
 * @param length - Length of random string
 * @returns Random alphanumeric string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// ENUM HELPERS
// ============================================================================

/**
 * Get expense category display name
 *
 * @param category - Expense category enum
 * @returns Human-readable category name
 */
export function getExpenseCategoryLabel(category: ExpenseCategory): string {
  const labels: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: 'Food & Dining',
    [ExpenseCategory.TRANSPORTATION]: 'Transportation',
    [ExpenseCategory.ACCOMMODATION]: 'Accommodation',
    [ExpenseCategory.ENTERTAINMENT]: 'Entertainment',
    [ExpenseCategory.UTILITIES]: 'Utilities',
    [ExpenseCategory.GROCERIES]: 'Groceries',
    [ExpenseCategory.SHOPPING]: 'Shopping',
    [ExpenseCategory.HEALTHCARE]: 'Healthcare',
    [ExpenseCategory.EDUCATION]: 'Education',
    [ExpenseCategory.BUSINESS]: 'Business',
    [ExpenseCategory.RENT]: 'Rent',
    [ExpenseCategory.OTHER]: 'Other',
  };

  return labels[category] || category;
}

/**
 * Get settlement status display name
 *
 * @param status - Settlement status enum
 * @returns Human-readable status name
 */
export function getSettlementStatusLabel(status: SettlementStatus): string {
  const labels: Record<SettlementStatus, string> = {
    [SettlementStatus.PENDING]: 'Pending',
    [SettlementStatus.IN_PROGRESS]: 'In Progress',
    [SettlementStatus.COMPLETED]: 'Completed',
    [SettlementStatus.CANCELLED]: 'Cancelled',
  };

  return labels[status] || status;
}

/**
 * Get group role display name
 *
 * @param role - Group role enum
 * @returns Human-readable role name
 */
export function getGroupRoleLabel(role: GroupRole): string {
  const labels: Record<GroupRole, string> = {
    [GroupRole.ADMIN]: 'Admin',
    [GroupRole.MEMBER]: 'Member',
  };

  return labels[role] || role;
}

/**
 * Get expense category icon name (for lucide-react)
 *
 * @param category - Expense category enum
 * @returns Lucide icon name
 */
export function getExpenseCategoryIcon(category: ExpenseCategory): string {
  const icons: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: 'utensils',
    [ExpenseCategory.TRANSPORTATION]: 'car',
    [ExpenseCategory.ACCOMMODATION]: 'home',
    [ExpenseCategory.ENTERTAINMENT]: 'film',
    [ExpenseCategory.UTILITIES]: 'zap',
    [ExpenseCategory.GROCERIES]: 'shopping-cart',
    [ExpenseCategory.SHOPPING]: 'shopping-bag',
    [ExpenseCategory.HEALTHCARE]: 'heart-pulse',
    [ExpenseCategory.EDUCATION]: 'book',
    [ExpenseCategory.BUSINESS]: 'briefcase',
    [ExpenseCategory.RENT]: 'building',
    [ExpenseCategory.OTHER]: 'more-horizontal',
  };

  return icons[category] || 'circle';
}

/**
 * Get expense category color (for Tailwind classes)
 *
 * @param category - Expense category enum
 * @returns Tailwind color class
 */
export function getExpenseCategoryColor(category: ExpenseCategory): string {
  const colors: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: 'bg-orange-100 text-orange-700',
    [ExpenseCategory.TRANSPORTATION]: 'bg-blue-100 text-blue-700',
    [ExpenseCategory.ACCOMMODATION]: 'bg-purple-100 text-purple-700',
    [ExpenseCategory.ENTERTAINMENT]: 'bg-pink-100 text-pink-700',
    [ExpenseCategory.UTILITIES]: 'bg-yellow-100 text-yellow-700',
    [ExpenseCategory.GROCERIES]: 'bg-green-100 text-green-700',
    [ExpenseCategory.SHOPPING]: 'bg-indigo-100 text-indigo-700',
    [ExpenseCategory.HEALTHCARE]: 'bg-red-100 text-red-700',
    [ExpenseCategory.EDUCATION]: 'bg-cyan-100 text-cyan-700',
    [ExpenseCategory.BUSINESS]: 'bg-slate-100 text-slate-700',
    [ExpenseCategory.RENT]: 'bg-emerald-100 text-emerald-700',
    [ExpenseCategory.OTHER]: 'bg-gray-100 text-gray-700',
  };

  return colors[category] || 'bg-gray-100 text-gray-700';
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email address format
 *
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns True if valid URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 *
 * @param uuid - UUID string to validate
 * @returns True if valid UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Chunk array into smaller arrays
 *
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 *
 * @param array - Array with duplicates
 * @returns Array with unique values
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array by key
 *
 * @param array - Array to group
 * @param keyFn - Function to extract grouping key
 * @returns Object with grouped arrays
 *
 * @example
 * groupBy([{id: 1, type: 'a'}, {id: 2, type: 'b'}, {id: 3, type: 'a'}], item => item.type)
 * // { a: [{id: 1, type: 'a'}, {id: 3, type: 'a'}], b: [{id: 2, type: 'b'}] }
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 *
 * @param array - Array to sort
 * @param keyFn - Function to extract sort key
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 */
export function sortBy<T>(array: T[], keyFn: (item: T) => unknown, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);

    if (aKey < bKey) return order === 'asc' ? -1 : 1;
    if (aKey > bKey) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone object
 *
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Omit keys from object
 *
 * @param obj - Object to process
 * @param keys - Keys to omit
 * @returns Object with specified keys omitted
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Pick keys from object
 *
 * @param obj - Object to process
 * @param keys - Keys to pick
 * @returns Object with only specified keys
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// ============================================================================
// MATH UTILITIES
// ============================================================================

/**
 * Clamp number between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round number to specified decimal places
 *
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage
 *
 * @param value - Value
 * @param total - Total
 * @returns Percentage (0-100)
 */
export function calculatePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Sleep for specified milliseconds
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise that resolves with function result
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Get error message from error or string
 *
 * @param error - Error or string
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'An unknown error occurred';
}

/**
 * Create error with custom properties
 *
 * @param message - Error message
 * @param code - Error code
 * @param details - Additional error details
 * @returns Error object
 */
export function createError(
  message: string,
  code: string = 'UNKNOWN_ERROR',
  details?: unknown
): Error & { code: string; details?: unknown } {
  const error = new Error(message) as Error & { code: string; details?: unknown };
  error.code = code;
  error.details = details;
  return error;
}
