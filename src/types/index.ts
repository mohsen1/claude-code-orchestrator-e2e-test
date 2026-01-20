/**
 * Central type definitions export for SplitSync
 *
 * This file re-exports all type definitions for easy importing.
 * Import types from here: import type { User, Group, Expense } from '@/types'
 */

// Currency types
export type {
  CurrencyCode,
  CurrencyInfo,
  MonetaryAmount,
} from './currency';

export {
  CURRENCY_MAP,
  isValidMonetaryAmount,
  decimalToMonetary,
  monetaryToDecimal,
  formatCurrency,
  addMonetaryAmounts,
  subtractMonetaryAmounts,
  splitMonetaryAmount,
} from './currency';

// User types
export type {
  UserId,
  GroupRole,
  AccountType,
  User,
  UserCreateInput,
  UserUpdateInput,
  PublicUserProfile,
  UserMinimal,
  UserWithAuth,
  UserSession,
  UserBalanceSummary,
  UserStatistics,
  NotificationSettings,
  UserExtended,
} from './user';

export type {
  UserPrivacySettings,
  UserPreferences,
} from './user';

export {
  isEmailVerified,
  isGroupAdmin,
  getUserDisplayName,
  getUserAvatarUrl,
} from './user';

// Group types
export type {
  GroupId,
  InviteStatus,
  GroupVisibility,
  Group,
  GroupCreateInput,
  GroupUpdateInput,
  GroupMinimal,
  GroupMember,
  GroupMemberWithUser,
  GroupInvite,
  GroupInviteCreateInput,
  GroupWithMembers,
  GroupStatistics,
  GroupBalanceSummary,
  MemberBalances,
  GroupActivity,
  GroupActivitiesResponse,
} from './group';

export type {
  GroupSettings,
  ExpenseCategory,
} from './group';

export {
  isGroupArchived,
  canUserInvite,
  isInviteValid,
} from './group';

// Expense types
export type {
  ExpenseId,
  ExpenseSplitId,
  ExpenseStatus,
  SplitType,
  Expense,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  ExpenseMinimal,
  ExpenseWithSplits,
  ExpenseCategoryStats,
  ExpenseStatistics,
  Settlement,
  SettlementCreateInput,
  SettlementWithUsers,
  SimplifiedDebt,
  ExpenseReceipt,
} from './expense';

export {
  isExpenseDeleted,
  isExpenseActive,
  isSplitPaid,
  calculateTotalFromSplits,
  validateSplits,
  calculatePercentageSplits,
  calculateEqualSplits,
  calculateSharesSplits,
} from './expense';

// Common utility types
export type {
  UUID,
  DateTime,
  Timestamp,
  ISO8601String,
} from './common';

// API Response types
export type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationParams,
  SortOrder,
} from './api';

// Re-export commonly used type aliases
export type { UserId as ID } from './user';
export type { GroupId as ExpenseGroupId } from './group';
export type { MonetaryAmount as Money } from './currency';

// Type guards
export type TypeGuard<T> = (value: unknown) => value is T;

// Error types
export class SplitSyncError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SplitSyncError';
  }
}

export class ValidationError extends SplitSyncError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends SplitSyncError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      'NOT_FOUND',
      404
    );
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends SplitSyncError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends SplitSyncError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends SplitSyncError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

// Database types
export type {
  DbClient,
  DbTransaction,
  QueryResult,
} from './database';

// Socket.io event types
export type {
  SocketEvent,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './socket';

// Export all for barrel import
export * from './currency';
export * from './user';
export * from './group';
export * from './expense';
