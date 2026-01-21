/**
 * Application-wide constants for SplitSync
 */

// App metadata
export const APP_NAME = "SplitSync";
export const APP_DESCRIPTION = "Expense sharing made simple";

// Database
export const DB_PATH = process.env.DATABASE_PATH || "./sqlite.db";

// Authentication
export const AUTH_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
export const AUTH_GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || "";
export const AUTH_GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// API routes
export const API_ROUTES = {
  AUTH: "/api/auth",
  GROUPS: "/api/groups",
  EXPENSES: "/api/expenses",
  USERS: "/api/users",
  SETTLEMENTS: "/api/settlements",
} as const;

// Socket.io events
export const SOCKET_EVENTS = {
  JOIN_GROUP: "join_group",
  LEAVE_GROUP: "leave_group",
  EXPENSE_CREATED: "expense_created",
  EXPENSE_UPDATED: "expense_updated",
  EXPENSE_DELETED: "expense_deleted",
  GROUP_UPDATED: "group_updated",
  MEMBER_ADDED: "member_added",
  MEMBER_REMOVED: "member_removed",
} as const;

// Money constants
export const MONEY_PRECISION = 2; // Decimal places for display
export const CENTS_PER_DOLLAR = 100; // For integer storage

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Validation limits
export const LIMITS = {
  GROUP_NAME_MIN: 1,
  GROUP_NAME_MAX: 50,
  EXPENSE_DESCRIPTION_MIN: 1,
  EXPENSE_DESCRIPTION_MAX: 200,
  EXPENSE_AMOUNT_MIN: 1, // in cents ($0.01)
  EXPENSE_AMOUNT_MAX: 10000000, // in cents ($100,000)
  USER_NAME_MIN: 1,
  USER_NAME_MAX: 50,
} as const;
