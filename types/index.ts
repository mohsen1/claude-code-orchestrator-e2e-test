/**
 * Core type definitions for SplitSync application
 */

/**
 * User entity representing application users
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group entity for expense sharing groups
 */
export interface Group {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
  memberCount?: number;
}

/**
 * Group member with role information
 */
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: Date;
  user?: User;
}

/**
 * Expense entity
 */
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amountInCents: number;
  payerId: string;
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  payer?: User;
  splits?: ExpenseSplit[];
}

/**
 * Individual split of an expense
 */
export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amountInCents: number;
  createdAt: Date;
  user?: User;
}

/**
 * Settlement记录
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amountInCents: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  completedAt?: Date | null;
  fromUser?: User;
  toUser?: User;
}

/**
 * Invite link for group invitations
 */
export interface InviteLink {
  id: string;
  groupId: string;
  token: string;
  createdBy: string;
  expiresAt: Date;
  maxUses?: number | null;
  useCount: number;
  createdAt: Date;
}

/**
 * User's balance in a group (positive = owed money, negative = owes money)
 */
export interface GroupBalance {
  userId: string;
  balanceInCents: number;
  user?: User;
}

/**
 * Settlement suggestion for minimizing transactions
 */
export interface SettlementSuggestion {
  fromUserId: string;
  toUserId: string;
  amountInCents: number;
  fromUser?: User;
  toUser?: User;
}

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
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
}

/**
 * Real-time socket event types
 */
export enum SocketEventType {
  GROUP_UPDATED = "group:updated",
  EXPENSE_CREATED = "expense:created",
  EXPENSE_UPDATED = "expense:updated",
  EXPENSE_DELETED = "expense:deleted",
  SETTLEMENT_CREATED = "settlement:created",
  SETTLEMENT_UPDATED = "settlement:updated",
  MEMBER_JOINED = "member:joined",
  MEMBER_LEFT = "member:left",
  BALANCE_CHANGED = "balance:changed",
}

/**
 * Socket event payload base type
 */
export interface SocketEvent {
  type: SocketEventType;
  groupId: string;
  data: unknown;
  timestamp: Date;
}

/**
 * Currency codes enum
 */
export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CAD = "CAD",
  AUD = "AUD",
  CHF = "CHF",
  CNY = "CNY",
  INR = "INR",
}

/**
 * Expense categories
 */
export enum ExpenseCategory {
  GROCERIES = "Groceries",
  RENT = "Rent",
  UTILITIES = "Utilities",
  DINING = "Dining",
  TRANSPORTATION = "Transportation",
  ENTERTAINMENT = "Entertainment",
  SHOPPING = "Shopping",
  HEALTHCARE = "Healthcare",
  TRAVEL = "Travel",
  OTHER = "Other",
}

/**
 * Application error types
 */
export enum ErrorCode {
  // Auth errors (1000-1099)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  PERMISSION_DENIED = "PERMISSION_DENIED",

  // Validation errors (1100-1199)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Resource errors (1200-1299)
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",

  // Business logic errors (1300-1399)
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INVALID_OPERATION = "INVALID_OPERATION",
  LIMIT_EXCEEDED = "LIMIT_EXCEEDED",

  // System errors (5000-5999)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
}

/**
 * Application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}
