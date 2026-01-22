/**
 * SplitSync - Shared TypeScript Types and Interfaces
 *
 * This file contains all core types used throughout the application.
 * All monetary values are stored as integers (cents) to avoid floating-point precision issues.
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithAuth extends User {
  passwordHash: string;
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type UserUpdateInput = Partial<Pick<User, 'name' | 'avatar'>>;

// ============================================================================
// Group Types
// ============================================================================

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: Date;
}

export enum GroupMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface GroupWithMembers extends Group {
  members: Array<GroupMember & User>;
  memberCount: number;
}

export interface GroupWithExpenses extends Group {
  members: Array<GroupMember & User>;
  expenses: Expense[];
  totalExpenses: number;
}

export type GroupCreateInput = Pick<Group, 'name' | 'description'> & {
  createdBy: string;
};

export type GroupUpdateInput = Partial<Pick<Group, 'name' | 'description'>>;

// ============================================================================
// Expense Types
// ============================================================================

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // Stored in cents (integer)
  paidBy: string; // User ID
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // Amount this user owes (in cents)
}

export interface ExpenseWithSplits extends Expense {
  splits: Array<ExpenseSplit & User>;
  paidByUser: User;
  splitAmount: number; // Amount each person owes (for equal splits)
}

export interface ExpenseListItem extends Expense {
  paidByName: string;
  payerAvatar?: string | null;
}

export type ExpenseCreateInput = Pick<Expense, 'groupId' | 'description' | 'amount' | 'paidBy' | 'category' | 'date'>;

export type ExpenseUpdateInput = Partial<Pick<Expense, 'description' | 'amount' | 'category' | 'date'>>;

export enum ExpenseCategory {
  FOOD = 'food',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  UTILITIES = 'utilities',
  RENT = 'rent',
  TRAVEL = 'travel',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  OTHER = 'other',
}

// ============================================================================
// Payment Types
// ============================================================================

export interface Payment {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Amount paid (in cents)
  note?: string | null;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWithUsers extends Payment {
  fromUser: User;
  toUser: User;
}

export type PaymentCreateInput = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Settlement Types (Computed Debts)
// ============================================================================

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Amount owed (in cents)
  createdAt: Date;
  expiresAt: Date;
}

export interface SettlementWithUsers extends Settlement {
  fromUser: User;
  toUser: User;
}

export interface BalanceSummary {
  userId: string;
  user: User;
  totalOwed: number; // Total amount others owe this user (positive = they should receive money)
  totalOwing: number; // Total amount this user owes others (positive = they should pay)
  netBalance: number; // positive = net receiver, negative = net payer
}

export interface GroupSettlement {
  groupId: string;
  group: Group;
  balances: BalanceSummary[];
  suggestedPayments: Array<{
    from: User;
    to: User;
    amount: number;
  }>;
  totalSettled: number;
  totalPending: number;
}

// ============================================================================
// Calculation Types
// ============================================================================

export interface ExpenseContribution {
  userId: string;
  user: User;
  paid: number; // Total amount paid by this user
  owes: number; // Total amount this user owes
  share: number; // User's fair share of expenses
}

export interface DebtRelationship {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface SettlementPlan {
  payments: Array<{
    from: string;
    to: string;
    amount: number;
  }>;
  totalTransactions: number;
  totalAmount: number;
}

// ============================================================================
// Socket.io Event Types
// ============================================================================

export enum SocketEventType {
  // Group events
  GROUP_UPDATED = 'group:updated',
  GROUP_MEMBER_ADDED = 'group:member:added',
  GROUP_MEMBER_REMOVED = 'group:member:removed',

  // Expense events
  EXPENSE_CREATED = 'expense:created',
  EXPENSE_UPDATED = 'expense:updated',
  EXPENSE_DELETED = 'expense:deleted',

  // Payment events
  PAYMENT_CREATED = 'payment:created',
  PAYMENT_UPDATED = 'payment:updated',

  // Settlement events
  SETTLEMENT_UPDATED = 'settlement:updated',

  // Connection events
  USER_JOINED_GROUP = 'user:joined:group',
  USER_LEFT_GROUP = 'user:left:group',
}

export interface GroupUpdatedEvent {
  groupId: string;
  group: Group;
  updatedAt: Date;
}

export interface ExpenseCreatedEvent {
  groupId: string;
  expense: ExpenseWithSplits;
  createdAt: Date;
}

export interface ExpenseUpdatedEvent {
  groupId: string;
  expense: ExpenseWithSplits;
  updatedAt: Date;
}

export interface ExpenseDeletedEvent {
  groupId: string;
  expenseId: string;
  deletedAt: Date;
}

export interface PaymentCreatedEvent {
  groupId: string;
  payment: PaymentWithUsers;
  createdAt: Date;
}

export interface SettlementUpdatedEvent {
  groupId: string;
  settlement: GroupSettlement;
  updatedAt: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Form/Validation Types
// ============================================================================

export interface CreateExpenseForm {
  description: string;
  amount: string; // String to handle decimal input, converted to cents
  paidBy: string;
  category: ExpenseCategory;
  date: string; // ISO date string
  splitAmong?: string[]; // User IDs to split among (empty = all members)
}

export interface CreateGroupForm {
  name: string;
  description?: string;
}

export interface JoinGroupForm {
  inviteCode: string;
}

export interface RecordPaymentForm {
  fromUserId: string;
  toUserId: string;
  amount: string; // String to handle decimal input, converted to cents
  note?: string;
  paymentDate: string; // ISO date string
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface GroupStatistics {
  groupId: string;
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  expenseCount: number;
  memberCount: number;
  topSpenders: Array<{
    userId: string;
    userName: string;
    amount: number;
  }>;
  expensesByCategory: Array<{
    category: ExpenseCategory;
    amount: number;
    count: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string; // ISO month string (YYYY-MM)
    amount: number;
    count: number;
  }>;
}

export interface UserStatistics {
  userId: string;
  user: User;
  totalGroups: number;
  totalExpensesCreated: number;
  totalAmountPaid: number;
  totalAmountOwed: number;
  netBalance: number;
  mostActiveGroups: Array<{
    groupId: string;
    groupName: string;
    expenseCount: number;
    totalAmount: number;
  }>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type WithDates<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Money helper type - ensures amounts are in cents
export type Cents = number & { readonly __brand: unique symbol };

// Helper to convert dollars to cents
export function toCents(dollars: number): Cents {
  return Math.round(dollars * 100) as Cents;
}

// Helper to convert cents to dollars
export function toDollars(cents: Cents): number {
  return cents / 100;
}

// Format cents as currency string (USD)
export function formatCurrency(cents: Cents): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(toDollars(cents));
}

// ============================================================================
// Validation Error Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  data?: unknown;
}

// ============================================================================
// Filter/Sort Types
// ============================================================================

export interface ExpenseFilter {
  groupId?: string;
  paidBy?: string;
  category?: ExpenseCategory;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseSort {
  field: 'date' | 'amount' | 'description' | 'createdAt';
  order: 'asc' | 'desc';
}

export type ExpenseQuery = ExpenseFilter & ExpenseSort;

// ============================================================================
// Export Union Types
// ============================================================================

export type SocketEvent =
  | GroupUpdatedEvent
  | ExpenseCreatedEvent
  | ExpenseUpdatedEvent
  | ExpenseDeletedEvent
  | PaymentCreatedEvent
  | SettlementUpdatedEvent;

export type EntityWithUser<T> = T & {
  user?: User;
};

export type DateRange = {
  from: Date;
  to: Date;
};
