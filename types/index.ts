import type { User } from '@/lib/db/schema';

// Extended user type for frontend
export interface AuthUser extends User {
  image?: string | null;
}

// Group types
export interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
  createdBy: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  user?: AuthUser;
}

// Expense types
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // in cents
  paidBy: string;
  category?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  payer?: AuthUser;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // in cents
  percentage?: number | null;
  createdAt: Date;
  user?: AuthUser;
}

// Settlement types
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // in cents
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  fromUser?: AuthUser;
  toUser?: AuthUser;
}

// Invite link types
export interface InviteLink {
  id: string;
  groupId: string;
  token: string;
  createdBy: string;
  expiresAt?: Date | null;
  maxUses?: number | null;
  useCount: number;
  createdAt: Date;
}

// Form types
export interface CreateExpenseInput {
  description: string;
  amount: string; // Will be parsed to cents
  paidBy: string;
  category?: string;
  date?: Date;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: string;
  category?: string;
  date?: Date;
}

// API Response types
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
  totalPages: number;
}

// Balance calculation types
export interface UserBalance {
  userId: string;
  user: AuthUser;
  balance: number; // Positive = owed money, Negative = owes money
}

export interface SettlementProposal {
  fromUserId: string;
  toUserId: string;
  amount: number; // in cents
  fromUser: AuthUser;
  toUser: AuthUser;
}
