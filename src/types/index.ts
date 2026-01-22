/**
 * SplitSync - Shared Type Definitions
 *
 * This file contains all core TypeScript interfaces and types used throughout the application.
 * All types are production-ready with proper validation, enums, and documentation.
 */

// ============================================================================
// DOMAIN ENTITIES
// ============================================================================

/**
 * User entity representing application users
 * All monetary values are stored in cents (integers) to avoid floating-point precision issues
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
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
  code: string; // Unique invite code
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group member relationship
 */
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: Date;
}

/**
 * Expense entity for tracking shared expenses
 */
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // Stored in cents (integer)
  paidBy: string; // User ID
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Expense split details
 */
export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // Stored in cents (integer)
  createdAt: Date;
}

/**
 * Settlement entity for tracking debt simplification
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string; // User who owes money
  toUserId: string; // User who should receive money
  amount: number; // Stored in cents (integer)
  status: SettlementStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

// ============================================================================
// ENUMS
// ============================================================================

/**
 * User roles within a group
 */
export enum GroupMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Settlement status tracking
 */
export enum SettlementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Expense categories for better organization
 */
export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRANSPORTATION = 'TRANSPORTATION',
  ACCOMMODATION = 'ACCOMMODATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  UTILITIES = 'UTILITIES',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * User creation payload
 */
export interface CreateUserDto {
  email: string;
  name: string;
  avatar?: string;
}

/**
 * User update payload
 */
export interface UpdateUserDto {
  name?: string;
  avatar?: string;
}

/**
 * Group creation payload
 */
export interface CreateGroupDto {
  name: string;
  description?: string;
}

/**
 * Group update payload
 */
export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

/**
 * Expense creation payload with splits
 */
export interface CreateExpenseDto {
  groupId: string;
  description: string;
  amount: number; // In cents
  paidBy: string;
  category?: ExpenseCategory;
  date?: Date; // Defaults to now
  splitBetween: string[]; // User IDs to split between
}

/**
 * Expense update payload
 */
export interface UpdateExpenseDto {
  description?: string;
  amount?: number; // In cents
  category?: ExpenseCategory;
  date?: Date;
}

/**
 * Settlement creation payload
 */
export interface CreateSettlementDto {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // In cents
}

/**
 * Settlement completion payload
 */
export interface CompleteSettlementDto {
  settlementId: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Enriched user data with relationships
 */
export interface UserWithGroups extends User {
  groups?: GroupMember[];
}

/**
 * Enriched group data with member information
 */
export interface GroupWithMembers extends Group {
  members?: Array<GroupMember & { user: User }>;
  memberCount?: number;
}

/**
 * Enriched group data with detailed expense summary
 */
export interface GroupWithSummary extends Group {
  memberCount?: number;
  totalExpenses?: number; // In cents
  expenseCount?: number;
  pendingSettlements?: number;
}

/**
 * Enriched expense data with payer and splits
 */
export interface ExpenseWithDetails extends Expense {
  paidByUser?: User;
  splits?: Array<ExpenseSplit & { user: User }>;
  splitCount?: number;
}

/**
 * Enriched settlement data with user information
 */
export interface SettlementWithUsers extends Settlement {
  fromUser?: User;
  toUser?: User;
}

/**
 * Group expense summary for dashboard
 */
export interface GroupExpenseSummary {
  groupId: string;
  groupName: string;
  totalExpenses: number; // In cents
  yourShare: number; // In cents
  youPaid: number; // In cents
  youOwe: number; // In cents
  youAreOwed: number; // In cents
  expenseCount: number;
  memberCount: number;
}

/**
 * User balance summary
 */
export interface UserBalanceSummary {
  userId: string;
  totalOwed: number; // In cents - amount others owe them
  totalOwing: number; // In cents - amount they owe others
  netBalance: number; // In cents - positive means they're owed money
  groups: GroupExpenseSummary[];
}

/**
 * Debt graph node for settlement algorithm
 */
export interface DebtNode {
  userId: string;
  user: User;
  balance: number; // In cents - positive means they're owed
}

/**
 * Simplified settlement for debt resolution
 */
export interface SimplifiedSettlement {
  from: string; // User ID
  to: string; // User ID
  amount: number; // In cents
  fromUser?: User;
  toUser?: User;
}

// ============================================================================
// API RESPONSE WRAPPERS
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
    details?: unknown;
  };
  meta?: {
    timestamp: Date;
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
 * List query parameters
 */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Group list query parameters
 */
export interface GroupListQuery extends ListQueryParams {
  memberCount?: boolean;
  withSummary?: boolean;
}

/**
 * Expense list query parameters
 */
export interface ExpenseListQuery extends ListQueryParams {
  groupId?: string;
  userId?: string;
  category?: ExpenseCategory;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number; // In cents
  maxAmount?: number; // In cents
}

/**
 * Settlement list query parameters
 */
export interface SettlementListQuery extends ListQueryParams {
  groupId?: string;
  status?: SettlementStatus;
  fromUserId?: string;
  toUserId?: string;
}

// ============================================================================
// SOCKET.IO EVENT TYPES
// ============================================================================

/**
 * Base socket event structure
 */
export interface SocketEvent {
  type: string;
  data: unknown;
  timestamp: Date;
}

/**
 * Group created event
 */
export interface GroupCreatedEvent extends SocketEvent {
  type: 'group:created';
  data: {
    group: GroupWithMembers;
    creator: User;
  };
}

/**
 * Group updated event
 */
export interface GroupUpdatedEvent extends SocketEvent {
  type: 'group:updated';
  data: {
    group: GroupWithMembers;
  };
}

/**
 * Member joined event
 */
export interface MemberJoinedEvent extends SocketEvent {
  type: 'group:member_joined';
  data: {
    groupId: string;
    member: GroupMember & { user: User };
  };
}

/**
 * Member left event
 */
export interface MemberLeftEvent extends SocketEvent {
  type: 'group:member_left';
  data: {
    groupId: string;
    userId: string;
  };
}

/**
 * Expense created event
 */
export interface ExpenseCreatedEvent extends SocketEvent {
  type: 'expense:created';
  data: {
    expense: ExpenseWithDetails;
    group: Group;
  };
}

/**
 * Expense updated event
 */
export interface ExpenseUpdatedEvent extends SocketEvent {
  type: 'expense:updated';
  data: {
    expense: ExpenseWithDetails;
  };
}

/**
 * Expense deleted event
 */
export interface ExpenseDeletedEvent extends SocketEvent {
  type: 'expense:deleted';
  data: {
    expenseId: string;
    groupId: string;
  };
}

/**
 * Settlement created event
 */
export interface SettlementCreatedEvent extends SocketEvent {
  type: 'settlement:created';
  data: {
    settlement: SettlementWithUsers;
    group: Group;
  };
}

/**
 * Settlement completed event
 */
export interface SettlementCompletedEvent extends SocketEvent {
  type: 'settlement:completed';
  data: {
    settlement: SettlementWithUsers;
  };
}

/**
 * Settlement cancelled event
 */
export interface SettlementCancelledEvent extends SocketEvent {
  type: 'settlement:cancelled';
  data: {
    settlementId: string;
    groupId: string;
  };
}

/**
 * Union type of all socket events
 */
export type GroupSocketEvent =
  | GroupCreatedEvent
  | GroupUpdatedEvent
  | MemberJoinedEvent
  | MemberLeftEvent
  | ExpenseCreatedEvent
  | ExpenseUpdatedEvent
  | ExpenseDeletedEvent
  | SettlementCreatedEvent
  | SettlementCompletedEvent
  | SettlementCancelledEvent;

/**
 * Socket room identifier
 */
export interface SocketRoom {
  prefix: 'group';
  groupId: string;
}

/**
 * Socket to room mapping
 */
export type SocketRoomName = `${string}:${string}`;

// ============================================================================
// NEXTAUTH TYPES
// ============================================================================

/**
 * Extended user session data for NextAuth
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

/**
 * JWT token payload
 */
export interface JwtToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Session data structure
 */
export interface AppSession {
  user: AuthUser;
  expires: string;
}

// ============================================================================
// FORM & VALIDATION TYPES
// ============================================================================

/**
 * Form field errors map
 */
export interface FormErrors<T = Record<string, string>> {
  [key: string]: string | undefined;
}

/**
 * Validation result
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormErrors;
}

/**
 * Form submission state
 */
export interface FormState<T = unknown> {
  isSubmitting: boolean;
  errors: FormErrors;
  data?: T;
}

// ============================================================================
// UI/COMPONENT TYPES
// ============================================================================

/**
 * Table column definition
 */
export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

/**
 * Table sort state
 */
export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  data?: unknown;
}

/**
 * Dropdown menu item
 */
export interface MenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'primary';
  disabled?: boolean;
}

/**
 * Toast notification
 */
export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Donut chart data
 */
export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

/**
 * Bar chart data
 */
export interface BarChartData {
  category: string;
  value: number;
  breakdown?: Record<string, number>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract keys from type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Make specific keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Omit nested keys
 */
export type OmitNested<T, K extends string> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// ============================================================================
// MONEY UTILITIES TYPES
// ============================================================================

/**
 * Currency representation (always stored as cents in DB)
 */
export type MoneyCents = number;

/**
 * Display currency (in dollars/units)
 */
export type MoneyDisplay = number;

/**
 * Currency format options
 */
export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Money calculation result
 */
export interface MoneyCalculation {
  amount: number; // In cents
  formatted: string;
  isNegative: boolean;
}

// ============================================================================
// DATABASE QUERY BUILDER TYPES
// ============================================================================

/**
 * Where clause operators
 */
export type WhereOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'like'
  | 'notLike'
  | 'isNull'
  | 'isNotNull'
  | 'between';

/**
 * Where condition
 */
export interface WhereCondition<T = unknown> {
  field: keyof T | string;
  operator: WhereOperator;
  value?: unknown;
  values?: unknown[];
}

/**
 * Query options
 */
export interface QueryOptions {
  where?: WhereCondition[];
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  offset?: number;
  include?: string[];
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Application error codes
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Business logic errors
  INVALID_EXPENSE_AMOUNT = 'INVALID_EXPENSE_AMOUNT',
  INVALID_SETTLEMENT = 'INVALID_SETTLEMENT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
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
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, { fields });
    this.name = 'ValidationError';
  }
}

/**
 * Not found error class
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
 * Forbidden error class
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(ErrorCode.FORBIDDEN, message, 403);
    this.name = 'ForbiddenError';
  }
}

// ============================================================================
// EXPORT ALL TYPES FOR CONVENIENCE
// ============================================================================

export type {
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Settlement,
  CreateUserDto,
  UpdateUserDto,
  CreateGroupDto,
  UpdateGroupDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  CreateSettlementDto,
  CompleteSettlementDto,
  UserWithGroups,
  GroupWithMembers,
  GroupWithSummary,
  ExpenseWithDetails,
  SettlementWithUsers,
  GroupExpenseSummary,
  UserBalanceSummary,
  DebtNode,
  SimplifiedSettlement,
  ApiResponse,
  PaginatedResponse,
  ListQueryParams,
  GroupListQuery,
  ExpenseListQuery,
  SettlementListQuery,
  AuthUser,
  JwtToken,
  AppSession,
  FormErrors,
  ValidationResult,
  FormState,
  TableColumn,
  TableSort,
  ModalState,
  MenuItem,
  ToastNotification,
  ChartDataPoint,
  DonutChartData,
  BarChartData,
  MoneyCents,
  MoneyDisplay,
  CurrencyFormatOptions,
  MoneyCalculation,
  WhereCondition,
  QueryOptions,
};
