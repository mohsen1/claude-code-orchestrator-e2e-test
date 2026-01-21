/**
 * User type definitions
 * Represents a user in the SplitSync application
 */

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation input type
 */
export interface CreateUserInput {
  name: string;
  email: string;
  image?: string;
  password?: string; // For credentials auth
}

/**
 * User update input type
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
  image?: string;
}

/**
 * User profile response (safe to expose to frontend)
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

/**
 * User with sensitive data (only for internal use)
 */
export interface UserWithSensitive extends User {
  hashedPassword?: string | null;
}

/**
 * User group membership information
 */
export interface UserGroupMembership {
  groupId: string;
  groupName: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  balance: number; // Net balance in cents (positive = owed money, negative = owes money)
}

/**
 * User statistics
 */
export interface UserStats {
  totalGroups: number;
  totalExpenses: number;
  totalOwed: number; // In cents
  totalOwing: number; // In cents
  netBalance: number; // In cents
}
