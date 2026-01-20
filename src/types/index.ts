// Core domain types for the expense sharing application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  user?: User;
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'rent'
  | 'travel'
  | 'health'
  | 'education'
  | 'other';

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency?: string;
  date: Date;
  category: ExpenseCategory;
  paidBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  splits?: ExpenseSplit[];
  payer?: User;
}

export type SplitType = 'equal' | 'percentage' | 'exact';

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  splitType: SplitType;
  percentage?: number | null;
  user?: User;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  fromUser?: User;
  toUser?: User;
}

// Balance summary types
export interface UserBalance {
  userId: string;
  user: User;
  totalOwed: number; // Amount others owe this user
  totalOwing: number; // Amount this user owes others
  netBalance: number; // Positive = they are owed money, Negative = they owe money
}

export interface GroupBalanceSummary {
  groupId: string;
  group: Group;
  balances: UserBalance[];
  settlements: Settlement[];
}

// Form input types
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
  amount: number;
  currency?: string;
  date: Date;
  category: ExpenseCategory;
  paidBy: string;
  splits: {
    userId: string;
    amount: number;
    splitType: SplitType;
    percentage?: number;
  }[];
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  category?: ExpenseCategory;
  paidBy?: string;
  splits?: {
    userId: string;
    amount: number;
    splitType: SplitType;
    percentage?: number;
  }[];
}

export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency?: string;
}

export interface UpdateSettlementInput {
  status?: 'pending' | 'completed' | 'cancelled';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Real-time event types
export interface SocketEvent {
  type: 'expense.created' | 'expense.updated' | 'expense.deleted'
       | 'settlement.created' | 'settlement.updated' | 'settlement.deleted'
       | 'group.member_added' | 'group.member_removed'
       | 'group.updated';
  groupId: string;
  data: any;
  timestamp: Date;
}
