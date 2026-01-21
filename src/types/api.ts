/**
 * Common API types and utilities
 */

/**
 * UUID type alias for better type safety
 */
export type UUID = string;

/**
 * Standard API response wrapper
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
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Date range filter
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Generic error response
 */
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}

/**
 * Common error codes
 */
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  EXPENSE_NOT_FOUND = 'EXPENSE_NOT_FOUND',
  SETTLEMENT_NOT_FOUND = 'SETTLEMENT_NOT_FOUND',

  // Conflict errors (409)
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  ALREADY_MEMBER = 'ALREADY_MEMBER',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Socket.io event types
 */
export enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Group events
  JOIN_GROUP = 'join_group',
  LEAVE_GROUP = 'leave_group',

  // Expense events
  EXPENSE_ADDED = 'expense_added',
  EXPENSE_UPDATED = 'expense_updated',
  EXPENSE_DELETED = 'expense_deleted',

  // Settlement events
  SETTLEMENT_ADDED = 'settlement_added',
  SETTLEMENT_COMPLETED = 'settlement_completed',

  // Member events
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',

  // Error events
  ERROR = 'error',
}

/**
 * Socket event payload types
 */
export interface ExpenseAddedPayload {
  groupId: UUID;
  expenseId: UUID;
  amount: number;
  description: string;
  payerId: UUID;
  payerName: string;
}

export interface SettlementCompletedPayload {
  groupId: UUID;
  settlementId: UUID;
  fromUserId: UUID;
  toUserId: UUID;
  amount: number;
}

export interface MemberJoinedPayload {
  groupId: UUID;
  userId: UUID;
  userName: string;
}
