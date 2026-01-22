// Central type definitions export for SplitSync application
// This file re-exports all domain types for easy importing throughout the application

// User-related types
export type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserProfile,
  UserSettings,
  UserStats,
} from './user'

// Group-related types
export type {
  Group,
  GroupCreateInput,
  GroupUpdateInput,
  GroupMember,
  GroupMemberRole,
  GroupInvite,
  GroupInviteStatus,
  GroupStats,
} from './group'

// Expense-related types
export type {
  Expense,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  ExpenseSplit,
  ExpenseSplitType,
  ExpenseCategory,
  ExpenseAttachment,
  ExpenseStats,
  ExpenseFilters,
} from './expense'

// Settlement-related types
export type {
  Settlement,
  SettlementCreateInput,
  SettlementUpdateInput,
  Debt,
  DebtGraph,
  SettlementPlan,
  SettlementStatus,
  SettlementStats,
} from './settlement'

// Authentication-related types
export type {
  AuthSession,
  AuthUser,
  AuthProvider,
  OAuthProfile,
  CredentialsProfile,
} from './auth'

// Common types used across the application
export type {
  ID,
  Timestamps,
  Money,
  Currency,
  ISO4217Currency,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  ApiError,
  ValidationError,
  SortOrder,
  DateRange,
  Email,
  URL,
  UUID,
} from './common'

// Utility types
export type {
  Nullable,
  Optional,
  PartialBy,
  RequiredBy,
  ReadonlyDeep,
  WritableDeep,
} from './utilities'
