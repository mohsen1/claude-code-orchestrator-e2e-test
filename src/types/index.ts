/**
 * Core type definitions for SplitSync application
 * All monetary values are stored as integers representing cents
 */

import type { User } from 'next-auth';
import type { Socket } from 'socket.io-client';

// =============================================================================
// USER TYPES
// =============================================================================

export interface ApplicationUser extends User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  defaultCurrency?: string;
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  emailOnExpenseAdded: boolean;
  emailOnSettlementDue: boolean;
  emailOnInviteAccepted: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
}

// =============================================================================
// GROUP TYPES
// =============================================================================

export type GroupRole = 'admin' | 'member';

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  currency: string;
  isActive: boolean;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
  totalExpenses?: number;
  totalBalance?: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  balance: number; // Current balance (positive = owed money, negative = owes money)
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedBy: string;
  invitedEmail: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  createdAt: Date;
}

// =============================================================================
// EXPENSE TYPES
// =============================================================================

export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number; // Amount in cents
  description: string;
  category?: string | null;
  date: Date;
  receiptUrl?: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  payer: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // Amount this user owes in cents
  percentage: number; // Percentage of total expense
  isPaid: boolean;
  createdAt: Date;
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'other';

// =============================================================================
// SETTLEMENT TYPES
// =============================================================================

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Amount in cents
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fromUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface SettlementPlan {
  groupId: string;
  totalAmount: number;
  transactions: SettlementTransaction[];
  generatedAt: Date;
}

export interface SettlementTransaction {
  fromUserId: string;
  toUserId: string;
  amount: number;
  fromUserName: string;
  toUserName: string;
}

// =============================================================================
// REAL-TIME TYPES
// =============================================================================

export type SocketEventType =
  | 'expense:created'
  | 'expense:updated'
  | 'expense:deleted'
  | 'settlement:created'
  | 'settlement:completed'
  | 'member:joined'
  | 'member:left'
  | 'group:updated'
  | 'balance:updated';

export interface SocketEvent<T = unknown> {
  type: SocketEventType;
  data: T;
  groupId: string;
  timestamp: Date;
  userId: string;
}

export interface SocketClient {
  socket: Socket | null;
  isConnected: boolean;
  connect: (groupId: string) => void;
  disconnect: () => void;
  emit: (event: string, data: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
}

// =============================================================================
// FORM & INPUT TYPES
// =============================================================================

export interface CreateGroupInput {
  name: string;
  description?: string;
  currency?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  currency?: string;
}

export interface CreateExpenseInput {
  groupId: string;
  amount: number;
  description: string;
  category?: ExpenseCategory;
  date?: Date;
  receiptUrl?: string;
  splitType?: 'equal' | 'custom' | 'percentage';
  splits?: Array<{ userId: string; amount?: number; percentage?: number }>;
}

export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: ExpenseCategory;
  date?: Date;
  receiptUrl?: string;
}

export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface InviteMemberInput {
  email: string;
  expiresIn?: number; // Hours until invite expires
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// DASHBOARD & ANALYTICS TYPES
// =============================================================================

export interface DashboardStats {
  totalGroups: number;
  activeGroups: number;
  totalExpenses: number;
  pendingSettlements: number;
  totalOwed: number;
  totalOwing: number;
  recentExpenses: Expense[];
  upcomingSettlements: Settlement[];
}

export interface GroupAnalytics {
  groupId: string;
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  topSpenders: Array<{
    userId: string;
    userName: string;
    amount: number;
  }>;
  expenseByCategory: Array<{
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export type NotificationType =
  | 'expense_added'
  | 'settlement_requested'
  | 'settlement_completed'
  | 'member_joined'
  | 'invite_accepted'
  | 'group_updated';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ApiError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export type ValidationError = {
  field: string;
  message: string;
  code: string;
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
