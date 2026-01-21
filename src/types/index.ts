/**
 * Central type exports for SplitSync application
 * This file re-exports all types for convenient importing
 */

// User types
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserProfile,
  UserWithSensitive,
  UserGroupMembership,
  UserStats,
} from './user';

// Group types
export type {
  Group,
  GroupMember,
  GroupRole,
  CreateGroupInput,
  UpdateGroupInput,
  GroupWithDetails,
  GroupInvite,
  CreateGroupInviteInput,
  GroupBalanceSummary,
} from './group';

// Expense types
export type {
  Expense,
  ExpenseSplit,
  SplitType,
  ExpenseWithDetails,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseCategory,
  ExpenseStats,
  ExpenseListItem,
} from './expense';

// Settlement types
export type {
  Settlement,
  SettlementStatus,
  SettlementWithDetails,
  DebtEdge,
  CreateSettlementInput,
  UpdateSettlementInput,
  UserBalance,
  SettlementPlan,
  SettlementStats,
} from './settlement';

/**
 * Common utility types
 */

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Currency information
 */
export interface Currency {
  code: string; // ISO 4217 code
  symbol: string;
  name: string;
  decimalDigits: number;
}

/**
 * Common currencies used in the app
 */
export const COMMON_CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalDigits: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalDigits: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalDigits: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalDigits: 0 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalDigits: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalDigits: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalDigits: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalDigits: 2 },
};

/**
 * Socket.io event types
 */
export interface SocketEvents {
  // Client -> Server
  'join_group': { groupId: string };
  'leave_group': { groupId: string };
  'expense_added': { expense: ExpenseWithDetails };
  'expense_updated': { expense: ExpenseWithDetails };
  'expense_deleted': { expenseId: string };
  'settlement_created': { settlement: SettlementWithDetails };
  'settlement_completed': { settlementId: string };
  'member_joined': { groupId: string; userId: string };
  'member_left': { groupId: string; userId: string };

  // Server -> Client
  'group_updated': { groupId: string };
  'new_expense': { expense: ExpenseWithDetails };
  'expense_modified': { expense: ExpenseWithDetails };
  'expense_removed': { expenseId: string; groupId: string };
  'new_settlement': { settlement: SettlementWithDetails };
  'settlement_updated': { settlement: SettlementWithDetails };
  'group_member_added': { groupId: string; member: GroupMember };
  'group_member_removed': { groupId: string; userId: string };
  'notification': { message: string; type: 'info' | 'success' | 'warning' | 'error' };
}

/**
 * Import ExpenseWithDetails and GroupMember for SocketEvents
 */
import type { ExpenseWithDetails } from './expense';
import type { GroupMember } from './group';
