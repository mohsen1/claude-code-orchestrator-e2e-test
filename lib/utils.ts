import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * This is the standard `cn` utility used in shadcn/ui components
 *
 * @param inputs - Class names to merge
 * @returns Merged class string with proper Tailwind handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Calculate splits for equal distribution
 */
export function calculateEqualSplits(amount: number, userIds: string[]): Map<string, number> {
  const splits = new Map<string, number>();
  const shareAmount = amount / userIds.length;

  // Handle floating point precision
  const roundedShare = Math.round(shareAmount * 100) / 100;
  let totalAssigned = 0;

  for (let i = 0; i < userIds.length; i++) {
    if (i === userIds.length - 1) {
      // Last person gets the remainder to account for rounding
      splits.set(userIds[i], Math.round((amount - totalAssigned) * 100) / 100);
    } else {
      splits.set(userIds[i], roundedShare);
      totalAssigned += roundedShare;
    }
  }

  return splits;
}

/**
 * Calculate percentage-based splits
 */
export function calculatePercentageSplits(
  amount: number,
  splits: { userId: string; percentage: number }[]
): Map<string, number> {
  const result = new Map<string, number>();
  let totalAssigned = 0;

  for (let i = 0; i < splits.length; i++) {
    const splitAmount = (amount * splits[i].percentage) / 100;
    const roundedAmount = Math.round(splitAmount * 100) / 100;

    if (i === splits.length - 1) {
      // Last person gets the remainder
      result.set(splits[i].userId, Math.round((amount - totalAssigned) * 100) / 100);
    } else {
      result.set(splits[i].userId, roundedAmount);
      totalAssigned += roundedAmount;
    }
  }

  return result;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
