// Database types for Drizzle ORM
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// Group management types
export interface Group {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

// Expense types - All monetary values in cents (integers)
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // in cents
  paidBy: string; // userId
  category: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // in cents
  percentage: number; // split percentage (e.g., 50 for 50%)
}

// Settlement types
export interface Settlement {
  id: string;
  groupId: string;
  from: string; // userId who owes
  to: string; // userId who is owed
  amount: number; // in cents
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt: Date | null;
}

// Activity log types
export interface Activity {
  id: string;
  groupId: string;
  userId: string;
  action: string;
  entityType: 'expense' | 'settlement' | 'group' | 'member';
  entityId: string;
  details: string; // JSON string
  createdAt: Date;
}

// Socket.io event types
export interface ServerToClientEvents {
  expenseCreated: (expense: ExpenseWithDetails) => void;
  expenseUpdated: (expense: ExpenseWithDetails) => void;
  expenseDeleted: (expenseId: string) => void;
  settlementCreated: (settlement: SettlementWithDetails) => void;
  settlementCompleted: (settlement: SettlementWithDetails) => void;
  memberJoined: (member: GroupMember & { user: User }) => void;
  memberLeft: (userId: string) => void;
  groupUpdated: (group: Group) => void;
}

export interface ClientToServerEvents {
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
}

// Enhanced types with relationships
export interface ExpenseWithDetails extends Expense {
  paidByUser: User;
  splits: (ExpenseSplit & { user: User })[];
  group: Group;
}

export interface SettlementWithDetails extends Settlement {
  fromUser: User;
  toUser: User;
  group: Group;
}

export interface GroupWithMembers extends Group {
  members: (GroupMember & { user: User })[];
  _count?: {
    expenses: number;
    members: number;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface CreateExpenseInput {
  description: string;
  amount: number; // in cents
  paidBy: string;
  category?: string;
  date?: Date;
  splitType: 'equal' | 'percentage' | 'exact';
  splits: Array<{
    userId: string;
    amount?: number; // for exact splits
    percentage?: number; // for percentage splits
  }>;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface CreateSettlementInput {
  from: string;
  to: string;
  amount: number; // in cents
}

// Balance calculation types
export interface UserBalance {
  userId: string;
  user: User;
  totalOwed: number; // in cents
  totalOwing: number; // in cents
  netBalance: number; // in cents (positive = owed, negative = owing)
}

export interface GroupBalances {
  groupId: string;
  balances: UserBalance[];
}

// Debt graph for settlement optimization
export interface DebtNode {
  userId: string;
  balance: number; // in cents
}

export interface SimplifiedDebt {
  from: string;
  to: string;
  amount: number; // in cents
}

// Validation schemas helpers
export interface ExpenseValidationError {
  field: string;
  message: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Currency utilities
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR';

export interface Money {
  amount: number; // in cents
  currency: CurrencyCode;
}
