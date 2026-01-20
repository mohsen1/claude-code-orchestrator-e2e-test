/**
 * User type definitions for SplitSync
 * Supports both OAuth and credential-based authentication
 */

import { CurrencyCode } from './currency';

/**
 * Unique identifier for users (UUID v4)
 */
export type UserId = string;

/**
 * User roles within a group
 */
export type GroupRole = 'admin' | 'member';

/**
 * User account types
 */
export type AccountType = 'email' | 'oauth' | 'both';

/**
 * User privacy settings
 */
export interface UserPrivacySettings {
  showEmail: boolean;
  showProfilePicture: boolean;
  allowInvites: boolean;
  notificationEmail: boolean;
  notificationPush: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  defaultCurrency: CurrencyCode;
  language: string;
  timezone: string;
  dateFormat: 'MDY' | 'DMY' | 'YMD';
  theme: 'light' | 'dark' | 'system';
}

/**
 * Complete user profile
 */
export interface User {
  id: UserId;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  accountType: AccountType;
  privacy: UserPrivacySettings;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * User data for creation (database insert)
 */
export interface UserCreateInput {
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  accountType?: AccountType;
  privacy?: Partial<UserPrivacySettings>;
  preferences?: Partial<UserPreferences>;
}

/**
 * User data for updates
 */
export interface UserUpdateInput {
  name?: string;
  image?: string | null;
  privacy?: Partial<UserPrivacySettings>;
  preferences?: Partial<UserPreferences>;
  lastLoginAt?: Date;
}

/**
 * Public user profile (safe to share with other users)
 * Excludes sensitive information like email verification status
 */
export interface PublicUserProfile {
  id: UserId;
  name: string;
  image: string | null;
  privacy: {
    showEmail: boolean;
    showProfilePicture: boolean;
  };
  createdAt: Date;
}

/**
 * Minimal user info for displays (e.g., in expense lists)
 */
export interface UserMinimal {
  id: UserId;
  name: string;
  image: string | null;
}

/**
 * User with authentication data (internal use only, never expose to clients)
 */
export interface UserWithAuth extends User {
  hashedPassword: string | null;
  oauthProvider: 'google' | 'github' | null;
  oauthAccountId: string | null;
}

/**
 * User session data (stored in JWT)
 */
export interface UserSession {
  userId: UserId;
  name: string;
  email: string;
  image: string | null;
  expires: Date;
}

/**
 * User balance summary (across all groups)
 */
export interface UserBalanceSummary {
  userId: UserId;
  totalOwed: number; // Monetary amount (integer)
  totalOwing: number; // Monetary amount (integer)
  netBalance: number; // Positive = you're owed money, Negative = you owe money
}

/**
 * User statistics
 */
export interface UserStatistics {
  userId: UserId;
  totalGroups: number;
  totalExpenses: number;
  totalPaid: number; // Monetary amount
  totalShare: number; // Monetary amount
  averageExpenseAmount: number; // Monetary amount
  largestExpense: number; // Monetary amount
  mostActiveGroup: {
    groupId: string;
    groupName: string;
    expenseCount: number;
  } | null;
}

/**
 * Type guard to check if user has verified email
 */
export function isEmailVerified(user: User | PublicUserProfile): boolean {
  return 'emailVerified' in user ? user.emailVerified !== null : true;
}

/**
 * Type guard to check if user is admin
 */
export function isGroupAdmin(userRole: GroupRole): boolean {
  return userRole === 'admin';
}

/**
 * Get user's display name (handles empty names)
 */
export function getUserDisplayName(user: User | UserMinimal | PublicUserProfile): string {
  return user.name?.trim() || 'Anonymous User';
}

/**
 * Get user's avatar URL (handles missing images)
 */
export function getUserAvatarUrl(user: User | UserMinimal | PublicUserProfile): string {
  if (user.image) {
    return user.image;
  }

  // Generate default avatar with initials
  const initials = getUserDisplayName(user)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Using UI Avatars API for generated avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`;
}

/**
 * User notification settings
 */
export interface NotificationSettings {
  email: {
    newExpense: boolean;
    expenseSettled: boolean;
    groupInvite: boolean;
    weeklySummary: boolean;
    monthlySummary: boolean;
  };
  push: {
    newExpense: boolean;
    expenseSettled: boolean;
    groupInvite: boolean;
    mentionedInComment: boolean;
  };
}

/**
 * Extend User with notification settings
 */
export interface UserExtended extends User {
  notifications: NotificationSettings;
}
