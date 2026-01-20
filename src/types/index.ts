/**
 * Type Definitions Index
 *
 * Centralized exports for all type definitions used in the SplitSync application.
 * This file provides a single entry point for importing types.
 */

// Database Schema Types
export * from "./db";

// Zod Validation Schemas
export * from "./validations";

// Form Types for React Hook Form
export * from "./forms";

/**
 * Common Application Types
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API Error Response
 *
 * Represents an error response from the API with a success flag.
 * In error contexts, the success value will always be false.
 */
export interface ApiError {
  /**
   * Success flag - always false in error contexts.
   * This property is typed as boolean for consistency with ApiResponse,
   * but will always have the value false when used as an ApiError.
   */
  success: boolean;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * User Session Type
 */
export interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  expires: string;
}

/**
 * Socket.io Event Types
 */

/**
 * Socket event payloads
 */
export interface SocketEvents {
  // Client -> Server events
  join_group: { groupId: string };
  leave_group: { groupId: string };
  expense_added: { groupId: string; expenseId: string };
  expense_updated: { groupId: string; expenseId: string };
  expense_deleted: { groupId: string; expenseId: string };
  settlement_created: { groupId: string; settlementId: string };
  member_joined: { groupId: string; userId: string };
  member_left: { groupId: string; userId: string };

  // Server -> Client events
  group_updated: { groupId: string };
  expense_created: { expense: import("./db").ExpenseWithSplits };
  expense_modified: { expenseId: string };
  expense_removed: { expenseId: string };
  settlement_recorded: { settlement: import("./db").Settlement };
  group_member_added: { member: import("./db").GroupMember & { user: import("./db").User } };
  group_member_removed: { userId: string };
}

/**
 * Currency Information
 */
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  symbolPosition: "before" | "after";
}

/**
 * Supported Currencies
 */
export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", decimals: 2, symbolPosition: "before" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", decimals: 2, symbolPosition: "before" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", decimals: 2, symbolPosition: "before" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0, symbolPosition: "before" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2, symbolPosition: "before" },
  CAD: { code: "CAD", symbol: "$", name: "Canadian Dollar", decimals: 2, symbolPosition: "before" },
  AUD: { code: "AUD", symbol: "$", name: "Australian Dollar", decimals: 2, symbolPosition: "before" },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", decimals: 2, symbolPosition: "after" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimals: 2, symbolPosition: "before" },
  MXN: { code: "MXN", symbol: "$", name: "Mexican Peso", decimals: 2, symbolPosition: "before" },
};

/**
 * Environment Configuration
 */
export interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  DATABASE_URL: string;
  NEXT_PUBLIC_APP_URL: string;
  AUTH_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

/**
 * Application Feature Flags
 */
export interface FeatureFlags {
  enableOAuth: boolean;
  enableEmailAuth: boolean;
  enableInvites: boolean;
  maxGroupMembers: number;
  maxExpenseAmount: number;
}

/**
 * Toast/Notification Types
 */
export interface ToastMessage {
  id?: string;
  title: string;
  description?: string;
  variant: "success" | "error" | "warning" | "info";
  duration?: number;
}

/**
 * Modal/Dialog State
 */
export interface DialogState {
  isOpen: boolean;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

/**
 * Loading State
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Async Operation State
 */
export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Chart Data Types (for analytics/dashboard)
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
}

export interface ExpenseChartData {
  totalExpenses: number;
  expenseCount: number;
  byCategory: ChartDataPoint[];
  overTime: ChartDataPoint[];
  topPayers: Array<{
    userId: string;
    userName: string;
    amount: number;
  }>;
}

/**
 * Balance Summary
 */
export interface BalanceSummary {
  totalBalance: number; // Positive = you're owed, Negative = you owe
  youAreOwed: number; // Total amount others owe you
  youOwe: number; // Total amount you owe others
  netBalance: number; // youAreOwed - youOwe
  currency: string;
}

/**
 * Settlement Suggestion
 * Generated by debt simplification algorithm
 */
export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number; // In cents
}
