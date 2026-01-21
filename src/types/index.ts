/**
 * Shared types for SplitSync application
 * Core domain types used across all Entity Modules
 */

// User types
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from './user';

// Group types
export type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  GroupWithMembers,
} from './group';

// Expense types
export type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseWithDetails,
  ExpenseSplit,
} from './expense';

// Settlement types
export type {
  Settlement,
  CreateSettlementInput,
  UpdateSettlementInput,
  SettlementWithUsers,
  SettlementSummary,
} from './settlement';

/**
 * Common error response type
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
