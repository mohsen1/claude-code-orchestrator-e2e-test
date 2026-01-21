/**
 * SplitSync Shared Type Definitions
 *
 * This file contains all TypeScript interfaces used across the application:
 * - Database model types
 * - API request/response types
 * - Socket.io event types
 */

// ============================================================================
// DATABASE MODEL TYPES
// ============================================================================

/**
 * User model representing an authenticated user
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  hashedPassword?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group model representing an expense-sharing group
 */
export interface Group {
  id: string;
  name: string;
  currency: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GroupMember model representing user membership in a group
 */
export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: Date;
}

/**
 * Available roles for group members
 */
export type GroupMemberRole = 'admin' | 'member';

/**
 * Expense model representing a shared expense
 */
export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number; // Stored as integer (cents/lowest currency unit)
  description: string;
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ExpenseSplit model representing how an expense is divided among members
 */
export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // The exact amount this person owes (in cents)
}

/**
 * Settlement model representing a payment between users
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Amount being settled (in cents)
  status: SettlementStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

/**
 * Available statuses for settlements
 */
export type SettlementStatus = 'pending' | 'completed' | 'cancelled';

/**
 * GroupInvite model for group invitation links
 */
export interface GroupInvite {
  id: string;
  groupId: string;
  invitedByUserId: string;
  expiresAt: Date;
  maxUses: number;
  useCount: number;
  createdAt: Date;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

/**
 * Request payload for creating a new group
 */
export interface CreateGroupRequest {
  name: string;
  currency: string;
}

/**
 * Request payload for updating a group
 */
export interface UpdateGroupRequest {
  name?: string;
  currency?: string;
}

/**
 * Request payload for inviting a user to a group
 */
export interface CreateInviteRequest {
  groupId: string;
  maxUses?: number;
  expiresInDays?: number;
}

/**
 * Request payload for joining a group via invite code
 */
export interface JoinGroupRequest {
  inviteCode: string;
}

/**
 * Request payload for updating a group member's role
 */
export interface UpdateMemberRoleRequest {
  userId: string;
  role: GroupMemberRole;
}

/**
 * Request payload for creating a new expense
 */
export interface CreateExpenseRequest {
  groupId: string;
  payerId: string;
  amount: number; // Amount in decimal (e.g., 10.50 for $10.50)
  description: string;
  category?: string;
  date?: string; // ISO date string
  splits: ExpenseSplitRequest[];
}

/**
 * Individual split configuration for expense creation
 */
export interface ExpenseSplitRequest {
  userId: string;
  amount: number; // Amount in decimal
}

/**
 * Request payload for updating an expense
 */
export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  splits?: ExpenseSplitRequest[];
}

/**
 * Request payload for creating a settlement
 */
export interface CreateSettlementRequest {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Amount in decimal
}

/**
 * Request payload for updating settlement status
 */
export interface UpdateSettlementRequest {
  status: SettlementStatus;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper for success responses
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Standard API response wrapper for error responses
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Response data for user profile
 */
export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
}

/**
 * Response data for group with member details
 */
export interface GroupDetailsResponse {
  id: string;
  name: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members: GroupMemberDetails[];
  totalExpenses: number;
  yourBalance?: number; // User's net balance in this group
}

/**
 * Extended group member details with user info
 */
export interface GroupMemberDetails {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: GroupMemberRole;
  joinedAt: string;
  balance?: number; // User's balance in the group
}

/**
 * Response data for expense with split details
 */
export interface ExpenseDetailsResponse {
  id: string;
  groupId: string;
  payerId: string;
  payerName: string;
  amount: number; // In decimal (formatted)
  description: string;
  category?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  splits: ExpenseSplitDetails[];
}

/**
 * Extended expense split with user info
 */
export interface ExpenseSplitDetails {
  userId: string;
  userName: string;
  amount: number; // In decimal (formatted)
}

/**
 * Response data for settlement
 */
export interface SettlementDetailsResponse {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number; // In decimal (formatted)
  status: SettlementStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

/**
 * Response data for group invite
 */
export interface InviteDetailsResponse {
  inviteCode: string;
  groupId: string;
  groupName: string;
  expiresAt: string;
  maxUses: number;
  remainingUses: number;
  inviteLink: string;
}

/**
 * Balance summary for a user in a group
 */
export interface BalanceSummary {
  userId: string;
  userName: string;
  totalOwed: number; // Positive = others owe this user
  totalOwing: number; // Positive = this user owes others
  netBalance: number; // Positive = net receiver, negative = net payer
}

/**
 * Settlement suggestion for optimal debt resolution
 */
export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number; // In decimal (formatted)
}

/**
 * Dashboard data response
 */
export interface DashboardResponse {
  groups: GroupSummary[];
  recentExpenses: ExpenseSummary[];
  pendingSettlements: SettlementDetailsResponse[];
  totalBalance: number; // Across all groups
}

/**
 * Simplified group summary for dashboard
 */
export interface GroupSummary {
  id: string;
  name: string;
  currency: string;
  memberCount: number;
  yourBalance: number;
  lastActivity?: string;
}

/**
 * Simplified expense summary for lists
 */
export interface ExpenseSummary {
  id: string;
  groupId: string;
  groupName: string;
  description: string;
  amount: number;
  date: string;
}

// ============================================================================
// SOCKET.IO EVENT TYPES
// ============================================================================

/**
 * Socket.io event names
 */
export enum SocketEvents {
  // Client -> Server events
  JOIN_GROUP = 'join_group',
  LEAVE_GROUP = 'leave_group',

  // Server -> Client events
  EXPENSE_ADDED = 'expense_added',
  EXPENSE_UPDATED = 'expense_updated',
  EXPENSE_DELETED = 'expense_deleted',

  SETTLEMENT_CREATED = 'settlement_created',
  SETTLEMENT_UPDATED = 'settlement_updated',

  GROUP_UPDATED = 'group_updated',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_UPDATED = 'member_updated',

  USER_PRESENCE = 'user_presence', // For showing active users
  ERROR = 'error',
}

/**
 * Payload for joining a group room
 */
export interface JoinGroupPayload {
  groupId: string;
  userId: string;
}

/**
 * Payload for leaving a group room
 */
export interface LeaveGroupPayload {
  groupId: string;
  userId: string;
}

/**
 * Payload emitted when an expense is added
 */
export interface ExpenseAddedPayload {
  groupId: string;
  expense: ExpenseDetailsResponse;
  affectedBalances: BalanceSummary[];
}

/**
 * Payload emitted when an expense is updated
 */
export interface ExpenseUpdatedPayload {
  groupId: string;
  expense: ExpenseDetailsResponse;
  affectedBalances: BalanceSummary[];
}

/**
 * Payload emitted when an expense is deleted
 */
export interface ExpenseDeletedPayload {
  groupId: string;
  expenseId: string;
  affectedBalances: BalanceSummary[];
}

/**
 * Payload emitted when a settlement is created
 */
export interface SettlementCreatedPayload {
  groupId: string;
  settlement: SettlementDetailsResponse;
  affectedBalances: BalanceSummary[];
}

/**
 * Payload emitted when a settlement status changes
 */
export interface SettlementUpdatedPayload {
  groupId: string;
  settlement: SettlementDetailsResponse;
  affectedBalances: BalanceSummary[];
}

/**
 * Payload emitted when group details change
 */
export interface GroupUpdatedPayload {
  groupId: string;
  group: Partial<GroupDetailsResponse>;
}

/**
 * Payload emitted when a member joins the group
 */
export interface MemberAddedPayload {
  groupId: string;
  member: GroupMemberDetails;
}

/**
 * Payload emitted when a member is removed from the group
 */
export interface MemberRemovedPayload {
  groupId: string;
  userId: string;
}

/**
 * Payload emitted when a member's role changes
 */
export interface MemberUpdatedPayload {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
}

/**
 * Payload for tracking user presence in groups
 */
export interface UserPresencePayload {
  groupId: string;
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
}

/**
 * Socket error payload
 */
export interface SocketErrorPayload {
  code: string;
  message: string;
  event?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for database row with timestamps
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UUID type alias for type safety
 */
export type UUID = string;

/**
 * Currency code (ISO 4217)
 */
export type CurrencyCode = string;

/**
 * Money amount stored in smallest unit (cents)
 */
export type MoneyCents = number;

/**
 * Money amount in decimal for display
 */
export type MoneyDecimal = number;

/**
 * Date string in ISO 8601 format
 */
export type ISODateString = string;

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Query parameters for pagination
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Query parameters for filtering expenses
 */
export interface ExpenseFilters extends PaginationQuery {
  groupId?: string;
  payerId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Query parameters for filtering settlements
 */
export interface SettlementFilters extends PaginationQuery {
  groupId?: string;
  status?: SettlementStatus;
  fromUserId?: string;
  toUserId?: string;
}

// ============================================================================
// FORM TYPES (React Hook Form + Zod integration)
// ============================================================================

/**
 * Form data for creating a group
 */
export interface CreateGroupFormData {
  name: string;
  currency: string;
}

/**
 * Form data for creating an expense
 */
export interface CreateExpenseFormData {
  amount: string; // String input for precision
  description: string;
  category?: string;
  date?: string;
  splitType: 'equal' | 'custom' | 'percentage';
  splits: Array<{
    userId: string;
    amount: string;
  }>;
}

/**
 * Form data for settling up
 */
export interface SettleUpFormData {
  fromUserId: string;
  toUserId: string;
  amount: string;
  notes?: string;
}

/**
 * Form data for user registration
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Form data for user login
 */
export interface LoginFormData {
  email: string;
  password: string;
}

// ============================================================================
// NEXT-AUTH TYPES
// ============================================================================

/**
 * Extended NextAuth session with user data
 */
export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  expires: string;
}

/**
 * JWT token payload
 */
export interface AuthToken {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
}

// ============================================================================
// DRIZZLE ORM RELATION TYPES
// ============================================================================

/**
 * Relations for queries with joins
 */
export interface GroupWithMembers extends Group {
  members: Array<GroupMember & { user: User }>;
}

export interface ExpenseWithSplits extends Expense {
  splits: Array<ExpenseSplit & { user: User }>;
  payer: User;
  group: Group;
}

export interface SettlementWithUsers extends Settlement {
  fromUser: User;
  toUser: User;
  group: Group;
}

export interface GroupMemberWithUser extends GroupMember {
  user: User;
  group: Group;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Database models
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Settlement,
  GroupInvite,

  // API Requests
  CreateGroupRequest,
  UpdateGroupRequest,
  CreateInviteRequest,
  JoinGroupRequest,
  UpdateMemberRoleRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateSettlementRequest,
  UpdateSettlementRequest,

  // API Responses
  ApiResponse,
  ApiErrorResponse,
  UserProfileResponse,
  GroupDetailsResponse,
  GroupMemberDetails,
  ExpenseDetailsResponse,
  ExpenseSplitDetails,
  SettlementDetailsResponse,
  InviteDetailsResponse,
  BalanceSummary,
  SettlementSuggestion,
  DashboardResponse,
  GroupSummary,
  ExpenseSummary,

  // Socket Events
  JoinGroupPayload,
  LeaveGroupPayload,
  ExpenseAddedPayload,
  ExpenseUpdatedPayload,
  ExpenseDeletedPayload,
  SettlementCreatedPayload,
  SettlementUpdatedPayload,
  GroupUpdatedPayload,
  MemberAddedPayload,
  MemberRemovedPayload,
  MemberUpdatedPayload,
  UserPresencePayload,
  SocketErrorPayload,

  // Utility
  PaginatedResponse,
  PaginationQuery,
  ExpenseFilters,
  SettlementFilters,

  // Forms
  CreateGroupFormData,
  CreateExpenseFormData,
  SettleUpFormData,
  RegisterFormData,
  LoginFormData,

  // Auth
  AuthSession,
  AuthToken,

  // Relations
  GroupWithMembers,
  ExpenseWithSplits,
  SettlementWithUsers,
  GroupMemberWithUser,
};
