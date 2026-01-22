/**
 * Core type definitions for SplitSync expense sharing application.
 * This file contains all shared TypeScript interfaces and types used across the application.
 */

// ============================================================================
// Domain Entity Types
// ============================================================================

/**
 * User entity representing an application user
 */
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group entity for expense sharing groups
 */
export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  memberCount: number;
  totalExpenses: number;
}

/**
 * Group member with role information
 */
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  user?: User;
}

/**
 * Enum for group member roles
 */
export enum GroupRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

/**
 * Expense entity
 */
export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number; // Stored in cents (integer)
  description: string;
  category: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Expense split for individual members
 */
export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // Stored in cents (integer)
  paidAt: Date | null;
}

/**
 * Settlement between users
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Stored in cents (integer)
  status: SettlementStatus;
  createdAt: Date;
  completedAt: Date | null;
}

/**
 * Enum for settlement status
 */
export enum SettlementStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/**
 * Invite link for group membership
 */
export interface InviteLink {
  id: string;
  groupId: string;
  token: string;
  createdBy: string;
  maxUses: number | null;
  useCount: number;
  expiresAt: Date | null;
  createdAt: Date;
}

// ============================================================================
// Balance & Calculation Types
// ============================================================================

/**
 * Balance information for a user in a group
 */
export interface UserBalance {
  userId: string;
  groupId: string;
  balance: number; // Positive = owed money, Negative = owes money
  totalPaid: number;
  totalOwed: number;
}

/**
 * Calculated settlement path (minimized transactions)
 */
export interface SettlementPath {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * Group balance summary
 */
export interface GroupBalance {
  groupId: string;
  balances: UserBalance[];
  settlementPaths: SettlementPath[];
  totalExpenses: number;
  totalSettled: number;
  lastUpdated: Date;
}

// ============================================================================
// DTO Types (Data Transfer Objects)
// ============================================================================

/**
 * Request payload for creating a group
 */
export interface CreateGroupInput {
  name: string;
  description?: string;
}

/**
 * Request payload for updating a group
 */
export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

/**
 * Request payload for creating an expense
 */
export interface CreateExpenseInput {
  groupId: string;
  amount: number; // In dollars/whatever currency, will be converted to cents
  description: string;
  category?: string;
  date?: Date;
}

/**
 * Request payload for updating an expense
 */
export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: string;
  date?: Date;
}

/**
 * Request payload for creating a settlement
 */
export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * Request payload for generating invite link
 */
export interface CreateInviteLinkInput {
  groupId: string;
  maxUses?: number;
  expiresInHours?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
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
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// WebSocket Types
// ============================================================================

/**
 * Real-time event types
 */
export enum SocketEventType {
  GROUP_CREATED = "group:created",
  GROUP_UPDATED = "group:updated",
  GROUP_DELETED = "group:deleted",
  EXPENSE_CREATED = "expense:created",
  EXPENSE_UPDATED = "expense:updated",
  EXPENSE_DELETED = "expense:deleted",
  SETTLEMENT_CREATED = "settlement:created",
  SETTLEMENT_COMPLETED = "settlement:completed",
  MEMBER_JOINED = "member:joined",
  MEMBER_LEFT = "member:left",
  BALANCE_UPDATED = "balance:updated",
}

/**
 * Socket event payload base
 */
export interface SocketEvent<T = unknown> {
  type: SocketEventType;
  groupId: string;
  data: T;
  timestamp: Date;
  userId?: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Session user type (NextAuth compatible)
 */
export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

/**
 * Authentication session
 */
export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * ID type for strong typing
 */
export type ID = string;

/**
 * Currency amount in cents (for precise financial calculations)
 */
export type Cents = number;

/**
 * Currency amount in dollars (for display purposes)
 */
export type Dollars = number;

/**
 * Timestamp ISO string
 */
export type Timestamp = string;

/**
 * Date range filter
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Filter options
 */
export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  dateRange?: DateRange;
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams extends PaginationOptions, SortOptions, FilterOptions {}

// ============================================================================
// Statistics & Analytics Types
// ============================================================================

/**
 * Group statistics
 */
export interface GroupStatistics {
  groupId: string;
  totalExpenses: number;
  totalAmount: number;
  totalSettlements: number;
  totalSettledAmount: number;
  averageExpenseAmount: number;
  topSpenders: Array<{
    userId: string;
    userName: string;
    amount: number;
  }>;
  expenseCategories: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Application error codes
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Authorization errors
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",

  // Business logic errors
  INVALID_OPERATION = "INVALID_OPERATION",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  EXPIRED_INVITE_LINK = "EXPIRED_INVITE_LINK",
  INVALID_INVITE_TOKEN = "INVALID_INVITE_TOKEN",

  // System errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

/**
 * Application error
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ============================================================================
// Feature Flag Types
// ============================================================================

/**
 * Feature flags
 */
export interface FeatureFlags {
  registrationEnabled: boolean;
  groupCreationEnabled: boolean;
  realTimeEnabled: boolean;
  fileUploadEnabled: boolean;
  analyticsEnabled: boolean;
}
