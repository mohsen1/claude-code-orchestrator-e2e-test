// Socket.io event names and types for expense-sharing app

// Client to Server events
export const ClientToServerEvents = {
  // Group events
  JOIN_GROUP: 'join_group',
  LEAVE_GROUP: 'leave_group',

  // Expense events
  CREATE_EXPENSE: 'create_expense',
  UPDATE_EXPENSE: 'update_expense',
  DELETE_EXPENSE: 'delete_expense',

  // Member events
  ADD_MEMBER: 'add_member',
  REMOVE_MEMBER: 'remove_member',
  UPDATE_MEMBER: 'update_member',

  // Settlement events
  SETTLE_UP: 'settle_up',
} as const;

// Server to Client events
export const ServerToClientEvents = {
  // Group events
  GROUP_CREATED: 'group_created',
  GROUP_UPDATED: 'group_updated',
  GROUP_DELETED: 'group_deleted',

  // Expense events
  EXPENSE_CREATED: 'expense_created',
  EXPENSE_UPDATED: 'expense_updated',
  EXPENSE_DELETED: 'expense_deleted',

  // Member events
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  MEMBER_UPDATED: 'member_updated',

  // Balance events
  BALANCES_UPDATED: 'balances_updated',

  // Settlement events
  SETTLEMENT_CREATED: 'settlement_created',

  // Error events
  ERROR: 'error',
} as const;

// Event payload types
export interface JoinGroupPayload {
  groupId: string;
}

export interface CreateExpensePayload {
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
  category?: string;
}

export interface UpdateExpensePayload {
  expenseId: string;
  description?: string;
  amount?: number;
  category?: string;
}

export interface DeleteExpensePayload {
  expenseId: string;
}

export interface AddMemberPayload {
  groupId: string;
  email: string;
}

export interface RemoveMemberPayload {
  groupId: string;
  memberId: string;
}

export interface SettleUpPayload {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}

// Response types
export interface ExpenseData {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: {
    id: string;
    name: string;
    email: string;
  };
  date: Date;
  category?: string;
  splitAmount: number;
}

export interface MemberData {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface GroupData {
  id: string;
  name: string;
  description?: string;
  members: MemberData[];
  createdAt: Date;
}

export interface BalanceData {
  userId: string;
  userName: string;
  balance: number;
  owes: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  owedBy: {
    userId: string;
    userName: string;
    amount: number;
  }[];
}

export interface SettlementData {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  createdAt: Date;
}

export type ClientToServerEventNames = keyof typeof ClientToServerEvents;
export type ServerToClientEventNames = keyof typeof ServerToClientEvents;
