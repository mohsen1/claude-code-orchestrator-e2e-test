/**
 * Shared type definitions for SplitSync application
 * These types are used across the application for type safety and consistency
 */

// =============================================================================
// User & Authentication Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: number | null;
  tokenType: string | null;
  scope: string | null;
  idToken: string | null;
  sessionState: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Group Types
// =============================================================================

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  inviteCode: string;
  inviteExpiresAt: Date | null;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: Date;
  balance: number; // Balance in cents (positive = owed money, negative = owes money)
}

export type GroupMemberRole = 'admin' | 'member';

export interface InviteLink {
  code: string;
  groupId: string;
  createdBy: string;
  expiresAt: Date | null;
  maxUses: number | null;
  useCount: number;
  createdAt: Date;
}

// =============================================================================
// Expense Types
// =============================================================================

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // Always stored in cents
  paidBy: string; // User ID
  category: ExpenseCategory | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  attachmentUrl: string | null;
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'other';

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // Amount in cents
  paid: boolean; // Whether this user has paid their share
  paidAt: Date | null;
}

// =============================================================================
// Settlement Types
// =============================================================================

export interface Settlement {
  id: string;
  groupId: string;
  from: string; // User ID who owes money
  to: string; // User ID who is owed money
  amount: number; // Amount in cents
  status: SettlementStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export type SettlementStatus = 'pending' | 'completed' | 'cancelled';

export interface DebtGraph {
  nodes: DebtNode[];
  edges: DebtEdge[];
}

export interface DebtNode {
  userId: string;
  userName: string;
  balance: number; // Net balance in cents
}

export interface DebtEdge {
  from: string; // User ID
  to: string; // User ID
  amount: number; // Amount in cents
}

// =============================================================================
// Socket.io Event Types
// =============================================================================

export interface SocketEventMap {
  // Client -> Server events
  'group:join': { groupId: string };
  'group:leave': { groupId: string };
  'expense:create': Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
  'expense:update': { id: string; updates: Partial<Expense> };
  'expense:delete': { id: string };
  'settlement:create': Omit<Settlement, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;
  'settlement:complete': { id: string };

  // Server -> Client events
  'expense:created': Expense;
  'expense:updated': Expense;
  'expense:deleted': { id: string };
  'settlement:created': Settlement;
  'settlement:completed': Settlement;
  'group:updated': Group;
  'member:joined': { groupId: string; userId: string };
  'member:left': { groupId: string; userId: string };
  'balance:updated': { groupId: string; balances: Record<string, number> };
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// Form & Validation Types
// =============================================================================

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface CreateExpenseInput {
  groupId: string;
  description: string;
  amount: number; // In dollars, will be converted to cents
  paidBy: string;
  category?: ExpenseCategory;
  date?: Date;
  attachment?: File;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: Date;
}

export interface CreateSettlementInput {
  groupId: string;
  from: string;
  to: string;
  amount: number; // In dollars, will be converted to cents
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// =============================================================================
// UI Component Props Types
// =============================================================================

export interface UserProfile {
  user: User;
  groups: Group[];
  totalBalance: number;
}

export interface GroupSummary {
  group: Group;
  members: Array<GroupMember & { user: User }>;
  expenses: Expense[];
  settlements: Settlement[];
  yourBalance: number;
}

export interface ExpenseWithSplits extends Expense {
  splits: Array<ExpenseSplit & { user: User }>;
  payer: User;
}

export interface SettlementWithUsers extends Settlement {
  fromUser: User;
  toUser: User;
}

// =============================================================================
// Utility Types
// =============================================================================

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type MaybePromise<T> = T | Promise<T>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// =============================================================================
// Error Types
// =============================================================================

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super('NOT_FOUND', `${resource}${id ? ` with id ${id}` : ''} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT', message, 409, details);
    this.name = 'ConflictError';
  }
}

// =============================================================================
// Database Query Types
// =============================================================================

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

// =============================================================================
// Statistics Types
// =============================================================================

export interface GroupStatistics {
  totalExpenses: number;
  totalAmount: number;
  totalMembers: number;
  totalSettlements: number;
  pendingSettlements: number;
  averageExpense: number;
  largestExpense: Expense | null;
  categoryBreakdown: Array<{
    category: ExpenseCategory;
    amount: number;
    count: number;
    percentage: number;
  }>;
}

export interface UserStatistics {
  totalGroups: number;
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
  totalExpensesCreated: number;
  totalExpensesPaid: number;
}
