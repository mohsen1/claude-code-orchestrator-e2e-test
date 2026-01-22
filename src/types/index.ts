/**
 * Shared type definitions for SplitSync application
 * All monetary values are stored as integers in cents (smallest currency unit)
 */

import { type User as NextAuthUser } from 'next-auth';

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User entity representing an application user
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User account type from NextAuth
 */
export type AuthUser = NextAuthUser & {
  id: string;
};

/**
 * User profile data for display
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  memberSince: Date;
}

// ============================================================================
// GROUP TYPES
// ============================================================================

/**
 * Group member role with different permission levels
 */
export enum GroupRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Group entity representing an expense sharing group
 */
export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  archivedAt: Date | null;
  inviteCode: string | null;
  inviteCodeExpiresAt: Date | null;
}

/**
 * Group membership relation
 */
export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  user?: User;
  group?: Group;
}

/**
 * Extended group with member information
 */
export interface GroupWithMembers extends Group {
  members: Array<GroupMember & { user: User }>;
  memberCount: number;
}

/**
 * Group summary for list views
 */
export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  expenseCount: number;
  totalBalance: number; // in cents
  userBalance: number; // in cents, positive = owed to user, negative = user owes
  createdAt: Date;
  isActive: boolean;
}

/**
 * Invite link information
 */
export interface InviteLink {
  code: string;
  groupId: string;
  groupName: string;
  expiresAt: Date | null;
  maxUses: number | null;
  useCount: number;
  createdBy: string;
  createdAt: Date;
}

// ============================================================================
// EXPENSE TYPES
// ============================================================================

/**
 * Expense category for categorization
 */
export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRANSPORTATION = 'TRANSPORTATION',
  ACCOMMODATION = 'ACCOMMODATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  UTILITIES = 'UTILITIES',
  GROCERIES = 'GROCERIES',
  SHOPPING = 'SHOPPING',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  BUSINESS = 'BUSINESS',
  RENT = 'RENT',
  OTHER = 'OTHER',
}

/**
 * Expense entity representing a shared expense
 * All amounts are stored in cents (integer)
 */
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // in cents
  category: ExpenseCategory;
  paidBy: string; // userId
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  receiptData: string | null; // JSON string for extracted receipt data
}

/**
 * Expense split details
 */
export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // in cents, share of the expense
  isPaid: boolean;
  createdAt: Date;
}

/**
 * Extended expense with related data
 */
export interface ExpenseWithDetails extends Expense {
  group: Group;
  payer: User;
  splits: Array<ExpenseSplit & { user: User }>;
  splitCount: number;
  amountPerPerson: number; // in cents
}

/**
 * Expense creation input
 */
export interface CreateExpenseInput {
  groupId: string;
  description: string;
  amount: number; // in cents
  category: ExpenseCategory;
  paidBy: string;
  paidAt: Date;
  attachmentUrl?: string | null;
  splitWith?: string[]; // Array of userIds to split with, defaults to all members
}

/**
 * Expense update input
 */
export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  paidAt?: Date;
  attachmentUrl?: string | null;
}

/**
 * Expense summary for list views
 */
export interface ExpenseSummary {
  id: string;
  description: string;
  amount: number; // in cents
  category: ExpenseCategory;
  paidBy: string;
  payerName: string;
  paidAt: Date;
  groupId: string;
  groupName: string;
  isUserPayer: boolean;
  userShare: number; // in cents
}

// ============================================================================
// SETTLEMENT TYPES
// ============================================================================

/**
 * Settlement status tracking
 */
export enum SettlementStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Settlement entity representing a debt settlement transaction
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // in cents
  status: SettlementStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  notes: string | null;
}

/**
 * Extended settlement with user information
 */
export interface SettlementWithUsers extends Settlement {
  fromUser: User;
  toUser: User;
  group: Group;
}

/**
 * Settlement summary for display
 */
export interface SettlementSummary {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number; // in cents
  status: SettlementStatus;
  isUserInvolved: boolean;
  isUserPayer: boolean; // true if current user is the payer (fromUserId)
  createdAt: Date;
  completedAt: Date | null;
}

/**
 * Debt graph edge for settlement calculations
 */
export interface DebtEdge {
  from: string; // userId
  to: string; // userId
  amount: number; // in cents
}

/**
 * Balance information for a user in a group
 */
export interface UserBalance {
  userId: string;
  userName: string;
  userImage: string | null;
  balance: number; // in cents, positive = owed to user, negative = user owes
  totalOwed: number; // total amount owed to this user
  totalOwing: number; // total amount this user owes
  lastActivity: Date | null;
}

/**
 * Group balance summary
 */
export interface GroupBalance {
  groupId: string;
  groupName: string;
  totalExpenses: number;
  totalSettled: number; // in cents
  totalPending: number; // in cents
  members: UserBalance[];
  simplifiedDebts: DebtEdge[]; // Optimized settlement paths
}

// ============================================================================
// ACTIVITY & AUDIT TYPES
// ============================================================================

/**
 * Activity action types for audit trail
 */
export enum ActivityAction {
  GROUP_CREATED = 'GROUP_CREATED',
  GROUP_UPDATED = 'GROUP_UPDATED',
  GROUP_ARCHIVED = 'GROUP_ARCHIVED',
  GROUP_DELETED = 'GROUP_DELETED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_LEFT = 'MEMBER_LEFT',
  MEMBER_ROLE_CHANGED = 'MEMBER_ROLE_CHANGED',
  EXPENSE_CREATED = 'EXPENSE_CREATED',
  EXPENSE_UPDATED = 'EXPENSE_UPDATED',
  EXPENSE_DELETED = 'EXPENSE_DELETED',
  SETTLEMENT_CREATED = 'SETTLEMENT_CREATED',
  SETTLEMENT_COMPLETED = 'SETTLEMENT_COMPLETED',
  SETTLEMENT_CANCELLED = 'SETTLEMENT_CANCELLED',
  INVITE_CREATED = 'INVITE_CREATED',
  INVITE_USED = 'INVITE_USED',
}

/**
 * Activity log entry for audit trail
 */
export interface Activity {
  id: string;
  groupId: string | null;
  userId: string;
  action: ActivityAction;
  entityType: 'GROUP' | 'EXPENSE' | 'SETTLEMENT' | 'MEMBER' | 'INVITE';
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Extended activity with user information
 */
export interface ActivityWithUser extends Activity {
  user: User;
}

/**
 * Activity summary for feed display
 */
export interface ActivitySummary {
  id: string;
  action: ActivityAction;
  userName: string;
  userImage: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  groupId: string | null;
  groupName: string | null;
}

// ============================================================================
// SOCKET.IO TYPES
// ============================================================================

/**
 * Real-time event types for Socket.io
 */
export enum SocketEventType {
  // Group events
  GROUP_UPDATED = 'GROUP_UPDATED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_LEFT = 'MEMBER_LEFT',

  // Expense events
  EXPENSE_CREATED = 'EXPENSE_CREATED',
  EXPENSE_UPDATED = 'EXPENSE_UPDATED',
  EXPENSE_DELETED = 'EXPENSE_DELETED',

  // Settlement events
  SETTLEMENT_CREATED = 'SETTLEMENT_CREATED',
  SETTLEMENT_UPDATED = 'SETTLEMENT_UPDATED',

  // Balance events
  BALANCE_CHANGED = 'BALANCE_CHANGED',

  // Presence events
  USER_JOINED_GROUP = 'USER_JOINED_GROUP',
  USER_LEFT_GROUP = 'USER_LEFT_GROUP',

  // Error events
  ERROR = 'ERROR',
}

/**
 * Socket event payload base type
 */
export interface SocketEvent {
  type: SocketEventType;
  groupId: string;
  timestamp: Date;
}

/**
 * Expense created event
 */
export interface ExpenseCreatedEvent extends SocketEvent {
  type: SocketEventType.EXPENSE_CREATED;
  expenseId: string;
  expense: ExpenseWithDetails;
}

/**
 * Expense updated event
 */
export interface ExpenseUpdatedEvent extends SocketEvent {
  type: SocketEventType.EXPENSE_UPDATED;
  expenseId: string;
  expense: ExpenseWithDetails;
}

/**
 * Expense deleted event
 */
export interface ExpenseDeletedEvent extends SocketEvent {
  type: SocketEventType.EXPENSE_DELETED;
  expenseId: string;
}

/**
 * Settlement created event
 */
export interface SettlementCreatedEvent extends SocketEvent {
  type: SocketEventType.SETTLEMENT_CREATED;
  settlementId: string;
  settlement: SettlementWithUsers;
}

/**
 * Balance changed event
 */
export interface BalanceChangedEvent extends SocketEvent {
  type: SocketEventType.BALANCE_CHANGED;
  groupId: string;
  balances: UserBalance[];
}

/**
 * Member joined event
 */
export interface MemberJoinedEvent extends SocketEvent {
  type: SocketEventType.MEMBER_JOINED;
  groupId: string;
  userId: string;
  user: User;
}

/**
 * Member left event
 */
export interface MemberLeftEvent extends SocketEvent {
  type: SocketEventType.MEMBER_LEFT;
  groupId: string;
  userId: string;
}

/**
 * User presence in group
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userImage: string | null;
  socketId: string;
  joinedAt: Date;
}

/**
 * Socket server to client event union
 */
export type ServerToClientEvent =
  | ExpenseCreatedEvent
  | ExpenseUpdatedEvent
  | ExpenseDeletedEvent
  | SettlementCreatedEvent
  | BalanceChangedEvent
  | MemberJoinedEvent
  | MemberLeftEvent
  | { type: SocketEventType.ERROR; error: string };

/**
 * Client to server event types
 */
export enum ClientSocketEvent {
  JOIN_GROUP = 'JOIN_GROUP',
  LEAVE_GROUP = 'LEAVE_GROUP',
  ACKNOWLEDGE_EVENT = 'ACKNOWLEDGE_EVENT',
}

/**
 * Join group event from client
 */
export interface JoinGroupEvent {
  groupId: string;
}

/**
 * Leave group event from client
 */
export interface LeaveGroupEvent {
  groupId: string;
}

/**
 * Client to server event union
 */
export type ClientToServerEvent =
  | JoinGroupEvent
  | LeaveGroupEvent;

// ============================================================================
// API TYPES
// ============================================================================

/**
 * API response wrapper
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
    requestId: string;
  };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API error types
 */
export enum ApiError {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search and filter parameters
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  groupId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  category?: ExpenseCategory;
  status?: SettlementStatus;
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form validation result
 */
export interface FormResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FieldError[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Optional fields helper
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required fields helper
 */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * ID type for strong typing
 */
export type Id = string & { readonly __brand: unique symbol };

/**
 * Money type for monetary values (cents)
 */
export type Money = number & { readonly __brand: 'money' };

/**
 * Timestamp type
 */
export type Timestamp = Date & { readonly __brand: 'timestamp' };
