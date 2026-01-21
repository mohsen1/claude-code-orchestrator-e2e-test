import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ============================================================================
 * DOMAIN MODELS
 * ============================================================================
 */

/**
 * User model representing authenticated users in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  hashedPassword?: string | null; // Null for OAuth users
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group model representing expense sharing groups
 */
export interface Group {
  id: string;
  name: string;
  currency: string; // ISO 4217 currency code (e.g., "USD", "EUR")
  createdBy: string; // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GroupMember model representing many-to-many relationship between Users and Groups
 */
export interface GroupMember {
  groupId: string;
  userId: string;
  role: "admin" | "member";
  joinedAt: Date;
}

/**
 * GroupMember with populated user details
 */
export interface GroupMemberWithUser extends GroupMember {
  user: User;
}

/**
 * Expense model representing individual expenses
 * Note: amount is stored in cents/lowest currency unit (integer) to avoid floating point errors
 */
export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number; // Stored as integer (e.g., $10.50 = 1050)
  description: string;
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ExpenseSplit model representing how an expense is divided among group members
 */
export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // The exact amount this user owes (in cents/lowest unit)
}

/**
 * ExpenseSplit with populated user details
 */
export interface ExpenseSplitWithUser extends ExpenseSplit {
  user: User;
}

/**
 * Settlement model representing payments between users to settle debts
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Amount being settled (in cents/lowest unit)
  settledAt: Date;
  createdAt: Date;
}

/**
 * Settlement with populated user details
 */
export interface SettlementWithUsers extends Settlement {
  fromUser: User;
  toUser: User;
}

/**
 * ============================================================================
 * ENRICHED MODELS (WITH RELATIONS)
 * ============================================================================
 */

/**
 * Expense with all related data populated
 */
export interface ExpenseWithDetails extends Expense {
  payer: User;
  splits: ExpenseSplitWithUser[];
  group: Group;
}

/**
 * Group with all members populated
 */
export interface GroupWithMembers extends Group {
  members: GroupMemberWithUser[];
  memberCount: number;
}

/**
 * Group with expenses and members
 */
export interface GroupWithExpenses extends GroupWithMembers {
  expenses: ExpenseWithDetails[];
}

/**
 * ============================================================================
 * BALANCE AND DEBT CALCULATIONS
 * ============================================================================
 */

/**
 * User balance within a group
 * Positive = owed money (others owe you)
 * Negative = you owe money
 */
export interface UserBalance {
  userId: string;
  user: User;
  balance: number; // In cents/lowest unit
}

/**
 * Simplified debt relationship
 * Represents who should pay whom and how much
 */
export interface DebtRelationship {
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  amount: number; // In cents/lowest unit
}

/**
 * ============================================================================
 * API RESPONSE TYPES
 * ============================================================================
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

/**
 * ============================================================================
 * ERROR TYPES
 * ============================================================================
 */

/**
 * Application error codes
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  // Authorization errors
  FORBIDDEN = "FORBIDDEN",
  NOT_GROUP_MEMBER = "NOT_GROUP_MEMBER",
  NOT_GROUP_ADMIN = "NOT_GROUP_ADMIN",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",

  // Business logic errors
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INVALID_EXPENSE_SPLIT = "INVALID_EXPENSE_SPLIT",
  INVALID_SETTLEMENT = "INVALID_SETTLEMENT",

  // Server errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
}

/**
 * Custom error class for application errors
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
    Error.captureStackTrace(this, this.constructor);
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * ============================================================================
 * SOCKET.IO EVENT TYPES
 * ============================================================================
 */

/**
 * Socket.IO event names
 */
export enum SocketEvent {
  // Client → Server events
  JOIN_GROUP = "join_group",
  LEAVE_GROUP = "leave_group",

  // Server → Client events
  EXPENSE_ADDED = "expense_added",
  EXPENSE_UPDATED = "expense_updated",
  EXPENSE_DELETED = "expense_deleted",
  SETTLEMENT_ADDED = "settlement_added",
  MEMBER_JOINED = "member_joined",
  MEMBER_LEFT = "member_left",
  GROUP_UPDATED = "group_updated",
}

/**
 * Socket event payload types
 */
export interface JoinGroupPayload {
  groupId: string;
}

export interface ExpenseAddedPayload {
  groupId: string;
  expense: ExpenseWithDetails;
}

export interface ExpenseUpdatedPayload {
  groupId: string;
  expense: ExpenseWithDetails;
}

export interface ExpenseDeletedPayload {
  groupId: string;
  expenseId: string;
}

export interface SettlementAddedPayload {
  groupId: string;
  settlement: SettlementWithUsers;
}

export interface MemberJoinedPayload {
  groupId: string;
  member: GroupMemberWithUser;
}

export interface MemberLeftPayload {
  groupId: string;
  userId: string;
}

export interface GroupUpdatedPayload {
  groupId: string;
  group: Group;
}

/**
 * ============================================================================
 * FORM TYPES
 * ============================================================================
 */

/**
 * Create group form data
 */
export interface CreateGroupInput {
  name: string;
  currency: string;
}

/**
 * Update group form data
 */
export interface UpdateGroupInput {
  name?: string;
  currency?: string;
}

/**
 * Create expense form data
 */
export interface CreateExpenseInput {
  groupId: string;
  amount: number; // In decimal dollars (e.g., 10.50)
  description: string;
  category?: string;
  date?: string; // ISO date string
  splitType?: "equal" | "exact" | "percentage";
  splits?: Array<{
    userId: string;
    amount?: number; // For exact splits
    percentage?: number; // For percentage splits
  }>;
}

/**
 * Update expense form data
 */
export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  splits?: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
}

/**
 * Create settlement form data
 */
export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // In decimal dollars
}

/**
 * ============================================================================
 * UTILITY TYPES
 * ============================================================================
 */

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract keys of type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * String literal to type
 */
export type StringLiteral<T> = T extends string ? T : never;

/**
 * Database filter type for queries
 */
export type DbFilter<T> = {
  [K in keyof T]?: T[K];
};

/**
 * ============================================================================
 * CURRENCY TYPES
 * ============================================================================
 */

/**
 * Supported currencies
 */
export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD"
  | "CHF"
  | "CNY"
  | "INR"
  | "MXN"
  | "BRL"
  | "SEK"
  | "NOK"
  | "DKK"
  | "SGD"
  | "HKD"
  | "KRW"
  | "TRY"
  | "PLN"
  | "THB";

/**
 * Currency metadata
 */
export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * ============================================================================
 * STATISTICS AND ANALYTICS TYPES
 * ============================================================================
 */

/**
 * Group statistics
 */
export interface GroupStatistics {
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  largestExpense: ExpenseWithDetails | null;
  smallestExpense: ExpenseWithDetails | null;
  memberCount: number;
  settlementsCount: number;
}

/**
 * User statistics across all groups
 */
export interface UserStatistics {
  totalGroups: number;
  totalExpenses: number;
  totalPaid: number;
  totalOwed: number;
  totalToReceive: number;
  netBalance: number;
}

/**
 * ============================================================================
 * NEXTAUTH TYPES
 * ============================================================================
 */

/**
 * Extended session type for NextAuth
 */
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Extended JWT type
 */
export interface AuthJWT {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Utility function to merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert decimal amount to cents/lowest unit
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents/lowest unit to decimal amount
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amountInCents: number,
  currency: CurrencyCode = "USD"
): string {
  const amount = fromCents(amountInCents);

  const currencyFormatters: Record<CurrencyCode, Intl.NumberFormatOptions> = {
    USD: { style: "currency", currency: "USD" },
    EUR: { style: "currency", currency: "EUR" },
    GBP: { style: "currency", currency: "GBP" },
    JPY: { style: "currency", currency: "JPY" },
    CAD: { style: "currency", currency: "CAD" },
    AUD: { style: "currency", currency: "AUD" },
    CHF: { style: "currency", currency: "CHF" },
    CNY: { style: "currency", currency: "CNY" },
    INR: { style: "currency", currency: "INR" },
    MXN: { style: "currency", currency: "MXN" },
    BRL: { style: "currency", currency: "BRL" },
    SEK: { style: "currency", currency: "SEK" },
    NOK: { style: "currency", currency: "NOK" },
    DKK: { style: "currency", currency: "DKK" },
    SGD: { style: "currency", currency: "SGD" },
    HKD: { style: "currency", currency: "HKD" },
    KRW: { style: "currency", currency: "KRW" },
    TRY: { style: "currency", currency: "TRY" },
    PLN: { style: "currency", currency: "PLN" },
    THB: { style: "currency", currency: "THB" },
  };

  return new Intl.NumberFormat("en-US", currencyFormatters[currency]).format(
    amount
  );
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Get currency information
 */
export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  const currencies: Record<CurrencyCode, CurrencyInfo> = {
    USD: { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
    EUR: { code: "EUR", symbol: "€", name: "Euro", decimals: 2 },
    GBP: { code: "GBP", symbol: "£", name: "British Pound", decimals: 2 },
    JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0 },
    CAD: { code: "CAD", symbol: "$", name: "Canadian Dollar", decimals: 2 },
    AUD: { code: "AUD", symbol: "$", name: "Australian Dollar", decimals: 2 },
    CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", decimals: 2 },
    CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimals: 2 },
    INR: { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2 },
    MXN: { code: "MXN", symbol: "$", name: "Mexican Peso", decimals: 2 },
    BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", decimals: 2 },
    SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona", decimals: 2 },
    NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone", decimals: 2 },
    DKK: { code: "DKK", symbol: "kr", name: "Danish Krone", decimals: 2 },
    SGD: { code: "SGD", symbol: "$", name: "Singapore Dollar", decimals: 2 },
    HKD: { code: "HKD", symbol: "$", name: "Hong Kong Dollar", decimals: 2 },
    KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", decimals: 0 },
    TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira", decimals: 2 },
    PLN: { code: "PLN", symbol: "zł", name: "Polish Zloty", decimals: 2 },
    THB: { code: "THB", symbol: "฿", name: "Thai Baht", decimals: 2 },
  };

  return currencies[code];
}
