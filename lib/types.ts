export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
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
  net: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed';
  createdAt: Date;
  completedAt?: Date | null;
}

// Extended types with relations
export interface GroupWithMembers extends Group {
  members: (User & { role: GroupMember['role'] })[];
}

export interface ExpenseWithSplits extends Expense {
  splits: (ExpenseSplit & { user: User })[];
  paidByUser: User;
}

export interface GroupWithExpenses extends Group {
  members: (User & { role: GroupMember['role'] })[];
  expenses: ExpenseWithSplits[];
  balances: Balance[];
}

// Auth session types
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// Database row types (matching SQLite schema)
export interface UserRow {
  id: string;
  email: string;
  name: string;
  image: string | null;
  created_at: string;
}

export interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMemberRow {
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface ExpenseRow {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSplitRow {
  expense_id: string;
  user_id: string;
  amount: number;
  percentage: number;
}

export interface SettlementRow {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Socket.io event types
export interface SocketEvents {
  // Server to client
  expenseCreated: ExpenseWithSplits;
  expenseUpdated: ExpenseWithSplits;
  expenseDeleted: { expenseId: string; groupId: string };
  memberAdded: { groupId: string; user: User };
  memberRemoved: { groupId: string; userId: string };
  balanceUpdated: { groupId: string; balances: Balance[] };
  settlementCreated: Settlement;
  settlementCompleted: { settlementId: string; groupId: string };

  // Client to server
  joinGroup: { groupId: string };
  leaveGroup: { groupId: string };
}
