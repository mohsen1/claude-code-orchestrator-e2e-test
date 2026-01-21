/**
 * Shared TypeScript types for SplitSync domain models
 * All monetary values are stored as integers (cents) to avoid floating-point precision issues
 */

/**
 * User model representing application users
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

/**
 * Group model representing expense-sharing groups
 */
export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: Date;
}

/**
 * Expense model representing individual expenses
 * Amount is stored in cents (integer) to ensure precision
 */
export interface Expense {
  id: string;
  groupId: string;
  amount: number; // in cents (integer)
  description: string;
  paidById: string;
  createdAt: Date;
}

/**
 * Settlement model representing debt settlements between users
 * Amount is stored in cents (integer) to ensure precision
 */
export interface Settlement {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // in cents (integer)
  groupId: string;
  settledAt: Date;
}

/**
 * GroupMember represents the relationship between users and groups
 */
export interface GroupMember {
  groupId: string;
  userId: string;
  joinedAt: Date;
}

/**
 * ExpenseSplit represents how an expense is split among users
 * For this MVP, all splits are equal, but this allows for future enhancement
 */
export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // in cents (integer)
}

/**
 * Balance represents the net balance for a user in a group
 * Positive = user is owed money
 * Negative = user owes money
 */
export interface Balance {
  userId: string;
  groupId: string;
  amount: number; // in cents (integer)
}

/**
 * Debt represents a simplified debt relationship between two users
 * Used in the settlement algorithm
 */
export interface Debt {
  fromUserId: string;
  toUserId: string;
  amount: number; // in cents (integer)
}

/**
 * UserWithGroupDetails extends User with group-specific information
 */
export interface UserWithGroupDetails extends User {
  balance?: number; // in cents (integer)
  joinedAt?: Date;
}

/**
 * GroupWithMembers extends Group with member information
 */
export interface GroupWithMembers extends Group {
  members: UserWithGroupDetails[];
  totalExpenses?: number;
}

/**
 * ExpenseWithDetails extends Expense with related entity information
 */
export interface ExpenseWithDetails extends Expense {
  paidBy?: User;
  group?: Group;
  splits?: ExpenseSplit[];
}

/**
 * SettlementWithDetails extends Settlement with related entity information
 */
export interface SettlementWithDetails extends Settlement {
  fromUser?: User;
  toUser?: User;
  group?: Group;
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
