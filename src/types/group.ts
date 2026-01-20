// Core group types for expense sharing application

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
  expenses: Expense[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export type MemberRole = 'owner' | 'admin' | 'member';

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  category: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  percentage: number;
}

export interface Balance {
  userId: string;
  groupId: string;
  owes: number;
  owed: number;
  netBalance: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  settledAt: Date;
  createdAt: Date;
}

// Types for creating and updating groups
export interface CreateGroupInput {
  name: string;
  description?: string;
  memberEmails?: string[];
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface CreateExpenseInput {
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  category?: string;
  date?: Date;
  splitType: 'equal' | 'custom';
  splits?: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  category?: string;
  date?: Date;
}

// Types for API responses
export interface GroupWithSummary extends Group {
  totalExpenses: number;
  memberCount: number;
  yourBalance?: number;
}

export interface ExpenseWithDetails extends Expense {
  paidByUser?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export type SplitType = 'equal' | 'custom' | 'percentage';

// Invitation types
export interface GroupInvite {
  id: string;
  groupId: string;
  email: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}
