// Re-export all types from individual type modules
export * from './auth';
export * from './expense';
export * from './group';
export * from './settlement';

// ============================================================================
// BASE & SHARED TYPES
// ============================================================================

/**
 * Database entity base interface
 * All entities have an ID and timestamps
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database entity with deletion tracking
 * Soft-deletable entities extend this interface
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt: Date | null;
}

/**
 * Currency codes supported by the application
 * Using ISO 4217 currency codes
 */
export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'INR'
  | 'CNY'
  | 'CHF'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'MXN'
  | 'BRL'
  | 'KRW'
  | 'SGD'
  | 'HKD'
  | 'NZD'
  | 'ZAR';

/**
 * Payment method identifiers
 */
export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'paypal'
  | 'venmo'
  | 'zelle'
  | 'wise'
  | 'revolut'
  | 'other';

/**
 * Monetary amount stored as integer cents
 * Always represents the smallest currency unit
 *
 * Examples:
 * - $10.50 USD = 1050 cents
 * - €5.00 EUR = 500 cents
 * - ¥1000 JPY = 1000 (JPY has no decimal places)
 */
export type MoneyAmount = number;

/**
 * User role in a group
 * - admin: Full permissions including group management and member removal
 * - member: Standard permissions for expense creation and viewing
 */
export type GroupRole = 'admin' | 'member';

/**
 * Expense categories for better organization
 */
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'health'
  | 'education'
  | 'business'
  | 'other';

/**
 * Application-wide event types for real-time updates
 * These events are broadcast via WebSocket connections
 */
export type RealTimeEventType =
  | 'expense:created'
  | 'expense:updated'
  | 'expense:deleted'
  | 'group:created'
  | 'group:updated'
  | 'group:deleted'
  | 'group:member_added'
  | 'group:member_removed'
  | 'group:member_role_changed'
  | 'settlement:created'
  | 'settlement:completed'
  | 'balance:updated';

/**
 * Base interface for real-time events
 */
export interface RealTimeEvent<T = unknown> {
  type: RealTimeEventType;
  groupId: string;
  data: T;
  timestamp: Date;
  userId: string;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API response wrapper
 * Standardized response format for all API endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
  };
}

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Generic sort parameters
 */
export interface SortParams {
  field: string;
  order: SortOrder;
}

/**
 * Date range filter
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Application error codes
 */
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Business Logic
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_SETTLEMENT = 'INVALID_SETTLEMENT',
  INVALID_GROUP_STATE = 'INVALID_GROUP_STATE',
  EXPIRED_INVITE_LINK = 'EXPIRED_INVITE_LINK',

  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Validation error with field-level details
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(ErrorCode.NOT_FOUND, message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(ErrorCode.FORBIDDEN, message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(ErrorCode.UNAUTHENTICATED, message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.CONFLICT, message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Utility type to make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type to make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Utility type to extract keys of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
