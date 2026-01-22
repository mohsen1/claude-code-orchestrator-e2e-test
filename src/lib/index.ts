/**
 * SplitSync - Library Index
 *
 * Central export point for all shared utilities, types, and helpers.
 */

// ============================================================================
// Export all types
// ============================================================================

export * from './types';

// ============================================================================
// Type Guards (Utility Functions)
// ============================================================================

import type {
  User,
  Group,
  Expense,
  Payment,
  Settlement,
  ExpenseCategory,
  GroupMemberRole,
  Cents,
} from './types';

/**
 * Type guard to check if a value is a valid User
 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value &&
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.name === 'string'
  );
}

/**
 * Type guard to check if a value is a valid Group
 */
export function isGroup(value: unknown): value is Group {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'inviteCode' in value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.inviteCode === 'string'
  );
}

/**
 * Type guard to check if a value is a valid Expense
 */
export function isExpense(value: unknown): value is Expense {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'groupId' in value &&
    'description' in value &&
    'amount' in value &&
    'paidBy' in value &&
    typeof value.id === 'string' &&
    typeof value.groupId === 'string' &&
    typeof value.description === 'string' &&
    typeof value.amount === 'number' &&
    typeof value.paidBy === 'string'
  );
}

/**
 * Type guard to check if a string is a valid ExpenseCategory
 */
export function isValidExpenseCategory(value: string): value is ExpenseCategory {
  return Object.values(ExpenseCategory).includes(value as ExpenseCategory);
}

/**
 * Type guard to check if a string is a valid GroupMemberRole
 */
export function isValidGroupMemberRole(value: string): value is GroupMemberRole {
  return Object.values(GroupMemberRole).includes(value as GroupMemberRole);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a random invite code for groups
 * Format: XXXX-XXXX (uppercase alphanumeric)
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];

  for (let i = 0; i < 2; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }

  return segments.join('-');
}

/**
 * Generate a unique ID (for use before database insertion)
 * Note: In production, the database should generate the actual IDs
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${timestamp}${randomStr}` : `${timestamp}${randomStr}`;
}

/**
 * Calculate the equal split amount for an expense
 * @param amountCents - Total expense amount in cents
 * @param numPeople - Number of people to split among
 * @returns Array of amounts for each person
 */
export function calculateEqualSplit(amountCents: Cents, numPeople: number): Cents[] {
  if (numPeople <= 0) {
    throw new Error('Number of people must be greater than 0');
  }

  const baseAmount = Math.floor(amountCents / numPeople) as Cents;
  const remainder = amountCents - (baseAmount * numPeople);

  const splits: Cents[] = Array(numPeople).fill(baseAmount);

  // Distribute remainder to first few people
  for (let i = 0; i < remainder; i++) {
    splits[i] = (splits[i] + 1) as Cents;
  }

  return splits;
}

/**
 * Calculate settlement plan to minimize transactions
 * Uses a greedy algorithm to settle debts with minimum number of transactions
 * @param balances - Array of { userId, balance } where positive = should receive, negative = should pay
 * @returns Array of optimal payment instructions
 */
export function calculateSettlements(
  balances: Array<{ userId: string; balance: Cents }>
): Array<{ from: string; to: string; amount: Cents }> {
  const settlements: Array<{ from: string; to: string; amount: Cents }> = [];

  // Separate debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ userId: b.userId, amount: Math.abs(b.balance) }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  const creditors = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ userId: b.userId, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  let debtorIdx = 0;
  let creditorIdx = 0;

  // Match debtors with creditors
  while (
    debtorIdx < debtors.length &&
    creditorIdx < creditors.length &&
    (debtors[debtorIdx].amount > 0 || creditors[creditorIdx].amount > 0)
  ) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const amount = Math.min(debtor.amount, creditor.amount) as Cents;

    if (amount > 0) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount,
      });

      debtor.amount = (debtor.amount - amount) as Cents;
      creditor.amount = (creditor.amount - amount) as Cents;
    }

    if (debtor.amount === 0) debtorIdx++;
    if (creditor.amount === 0) creditorIdx++;
  }

  return settlements;
}

/**
 * Calculate user balances in a group
 * @param expenses - All expenses in the group
 * @param payments - All recorded payments in the group
 * @returns Map of userId to balance (positive = net receiver, negative = net payer)
 */
export function calculateBalances(
  expenses: Array<{
    paidBy: string;
    amount: Cents;
    splits: Array<{ userId: string; amount: Cents }>;
  }>,
  payments: Array<{ fromUserId: string; toUserId: string; amount: Cents }>
): Map<string, Cents> {
  const balances = new Map<string, Cents>();

  // Initialize all users
  const userIds = new Set<string>();

  expenses.forEach((expense) => {
    userIds.add(expense.paidBy);
    expense.splits.forEach((split) => userIds.add(split.userId));
  });

  payments.forEach((payment) => {
    userIds.add(payment.fromUserId);
    userIds.add(payment.toUserId);
  });

  userIds.forEach((id) => balances.set(id, 0 as Cents));

  // Process expenses
  expenses.forEach((expense) => {
    // Payer paid the full amount
    const currentBalance = balances.get(expense.paidBy) || 0;
    balances.set(expense.paidBy, (currentBalance + expense.amount) as Cents);

    // Each splitter owes their share
    expense.splits.forEach((split) => {
      const splitBalance = balances.get(split.userId) || 0;
      balances.set(split.userId, (splitBalance - split.amount) as Cents);
    });
  });

  // Process payments
  payments.forEach((payment) => {
    // From user pays, so their balance decreases (they've settled some debt)
    const fromBalance = balances.get(payment.fromUserId) || 0;
    balances.set(payment.fromUserId, (fromBalance + payment.amount) as Cents);

    // To user receives, so their balance increases
    const toBalance = balances.get(payment.toUserId) || 0;
    balances.set(payment.toUserId, (toBalance - payment.amount) as Cents);
  });

  return balances;
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Deep clone an object (simple implementation)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function for limiting execution rate
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
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let delay = initialDelay;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Group an array of items by a key
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Map<T[K], T[]> {
  return array.reduce((map, item) => {
    const groupKey = item[key];
    const group = map.get(groupKey) || [];
    group.push(item);
    map.set(groupKey, group);
    return map;
  }, new Map<T[K], T[]>());
}

/**
 * Sort an array of items by a key
 */
export function sortBy<T, K extends keyof T>(
  array: T[],
  key: K,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Chunk an array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Generate a color based on a string (for avatars, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
