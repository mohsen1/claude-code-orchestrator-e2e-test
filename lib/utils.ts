import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type CurrencyCode } from "./types";

/**
 * ============================================================================
 * CLASS NAME UTILITIES
 * ============================================================================
 */

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ============================================================================
 * CURRENCY UTILITIES
 * ============================================================================
 */

/**
 * Convert decimal amount to cents/lowest currency unit (integer)
 * This prevents floating point arithmetic errors
 *
 * @example
 * toCents(10.50) // returns 1050
 * toCents(100.00) // returns 10000
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents/lowest currency unit to decimal amount
 *
 * @example
 * fromCents(1050) // returns 10.50
 * fromCents(10000) // returns 100.00
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Format currency amount for display
 *
 * @param amountInCents - Amount in cents/lowest unit
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amountInCents: number,
  currency: CurrencyCode = "USD",
  locale: string = "en-US"
): string {
  const amount = fromCents(amountInCents);

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });

  const formatted = formatter.format(1);
  return formatted.replace(/[0-9.,\s]/g, "");
}

/**
 * Get currency information
 */
export function getCurrencyInfo(currency: CurrencyCode) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });

  const parts = formatter.formatToParts(1);
  const symbol = parts.find(part => part.type === "currency")?.value || currency;

  return {
    code: currency,
    symbol,
    name: new Intl.DisplayNames(["en"], { type: "currency" }).of(currency),
  };
}

/**
 * ============================================================================
 * DATE/TIME UTILITIES
 * ============================================================================
 */

/**
 * Format date for display
 *
 * @param date - Date object or ISO string
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted date string (e.g., "Jan 1, 2024")
 */
export function formatDate(
  date: Date | string,
  locale: string = "en-US"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Format date and time for display
 *
 * @param date - Date object or ISO string
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted date and time string (e.g., "Jan 1, 2024, 2:30 PM")
 */
export function formatDateTime(
  date: Date | string,
  locale: string = "en-US"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format time for display
 *
 * @param date - Date object or ISO string
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(
  date: Date | string,
  locale: string = "en-US"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 *
 * @param date - Date object or ISO string
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the current week
 */
export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return d >= startOfWeek && d <= endOfWeek;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * ============================================================================
 * STRING UTILITIES
 * ============================================================================
 */

/**
 * Truncate string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

/**
 * ============================================================================
 * NUMBER UTILITIES
 * ============================================================================
 */

/**
 * Format large numbers with abbreviations
 *
 * @example
 * formatNumber(1500) // "1.5K"
 * formatNumber(1500000) // "1.5M"
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Round to a specified number of decimal places
 */
export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * ============================================================================
 * ARRAY UTILITIES
 * ============================================================================
 */

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by a key
 */
export function groupBy<T>(
  array: T[],
  keyGetter: (item: T) => string
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyGetter(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * ============================================================================
 * OBJECT UTILITIES
 * ============================================================================
 */

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get nested object property safely
 */
export function get<T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const value = path.split(".").reduce((current, key) => {
    return current?.[key] as Record<string, unknown> | undefined;
  }, obj);

  return value !== undefined ? (value as T) : defaultValue;
}

/**
 * Pick specific keys from an object
 */
export function pick<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * ============================================================================
 * VALIDATION UTILITIES
 * ============================================================================
 */

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * ============================================================================
 * MATH UTILITIES FOR EXPENSE SPLITTING
 * ============================================================================
 */

/**
 * Split amount equally among n people
 * Distributes remainder cents to avoid floating point errors
 *
 * @param amountInCents - Total amount in cents
 * @param count - Number of people to split among
 * @returns Array of amounts in cents for each person
 *
 * @example
 * splitEqually(1000, 3) // [334, 333, 333] - $10.00 split among 3
 */
export function splitEqually(amountInCents: number, count: number): number[] {
  if (count <= 0) throw new Error("Count must be greater than 0");
  if (amountInCents < 0) throw new Error("Amount cannot be negative");

  const baseAmount = Math.floor(amountInCents / count);
  const remainder = amountInCents % count;

  const splits = Array(count).fill(baseAmount);

  // Distribute remainder cents
  for (let i = 0; i < remainder; i++) {
    splits[i]++;
  }

  return splits;
}

/**
 * Calculate percentage-based splits
 * Ensures the sum matches the total amount
 *
 * @param amountInCents - Total amount in cents
 * @param percentages - Array of percentages for each person
 * @returns Array of amounts in cents for each person
 */
export function splitByPercentage(
  amountInCents: number,
  percentages: number[]
): number[] {
  if (percentages.length === 0) {
    throw new Error("Percentages array cannot be empty");
  }

  const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error("Percentages must sum to 100");
  }

  const splits = percentages.map((p) =>
    Math.round((amountInCents * p) / 100)
  );

  // Adjust for rounding errors
  const total = splits.reduce((sum, s) => sum + s, 0);
  const diff = amountInCents - total;

  if (diff !== 0) {
    // Add or subtract the difference from the largest split
    const maxIndex = splits.indexOf(Math.max(...splits));
    splits[maxIndex] += diff;
  }

  return splits;
}

/**
 * ============================================================================
 * ERROR HANDLING UTILITIES
 * ============================================================================
 */

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: Record<string, unknown>
) {
  return {
    success: false,
    error: {
      code: code || "INTERNAL_ERROR",
      message,
      statusCode,
      details,
    },
  };
}

/**
 * Create a standardized API success response
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * ============================================================================
 * ID GENERATION UTILITIES
 * ============================================================================
 */

/**
 * Generate a random UUID v4
 * Note: In production, use a proper UUID library like 'uuid'
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
}

/**
 * ============================================================================
 * COLOR UTILITIES
 * ============================================================================
 */

/**
 * Generate a consistent color from a string (for avatars, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Get a preset color based on index
 */
export function getPresetColor(index: number): string {
  const colors = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
  ];

  return colors[index % colors.length];
}
