// Socket.io event names and types
export const SocketEvents = {
  // Connection events
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Group events
  GROUP_JOIN: 'group:join',
  GROUP_LEAVE: 'group:leave',
  GROUP_CREATED: 'group:created',
  GROUP_UPDATED: 'group:updated',
  GROUP_DELETED: 'group:deleted',
  MEMBER_ADDED: 'group:member_added',
  MEMBER_REMOVED: 'group:member_removed',

  // Expense events
  EXPENSE_CREATED: 'expense:created',
  EXPENSE_UPDATED: 'expense:updated',
  EXPENSE_DELETED: 'expense:deleted',
  EXPENSES_UPDATED: 'expenses:updated',

  // Settlement events
  SETTLEMENT_CREATED: 'settlement:created',
  SETTLEMENT_UPDATED: 'settlement:updated',
  SETTLEMENT_DELETED: 'settlement:deleted',
  SETTLEMENTS_UPDATED: 'settlements:updated',

  // Balance events
  BALANCE_UPDATED: 'balance:updated',

  // Acknowledgment events
  ACK: 'ack',
} as const;

export type SocketEventName = typeof SocketEvents[keyof typeof SocketEvents];

// Base event payload interface
export interface BaseEventPayload {
  groupId?: string;
  timestamp: number;
}

// Group event payloads
export interface GroupCreatedPayload extends BaseEventPayload {
  group: {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: number;
  };
}

export interface GroupUpdatedPayload extends BaseEventPayload {
  groupId: string;
  changes: {
    name?: string;
    description?: string;
  };
}

export interface MemberAddedPayload extends BaseEventPayload {
  groupId: string;
  member: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MemberRemovedPayload extends BaseEventPayload {
  groupId: string;
  memberId: string;
}

// Expense event payloads
export interface ExpenseCreatedPayload extends BaseEventPayload {
  expense: {
    id: string;
    groupId: string;
    description: string;
    amount: number;
    paidBy: string;
    date: string;
    createdAt: number;
  };
  splits: {
    userId: string;
    amount: number;
  }[];
}

export interface ExpenseUpdatedPayload extends BaseEventPayload {
  expense: {
    id: string;
    groupId: string;
    description: string;
    amount: number;
    paidBy: string;
    date: string;
    updatedAt: number;
  };
  splits: {
    userId: string;
    amount: number;
  }[];
}

export interface ExpenseDeletedPayload extends BaseEventPayload {
  expenseId: string;
  groupId: string;
}

// Settlement event payloads
export interface SettlementCreatedPayload extends BaseEventPayload {
  settlement: {
    id: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    createdAt: number;
  };
}

export interface SettlementUpdatedPayload extends BaseEventPayload {
  settlement: {
    id: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    status: 'pending' | 'completed';
    updatedAt: number;
  };
}

export interface SettlementDeletedPayload extends BaseEventPayload {
  settlementId: string;
  groupId: string;
}

// Balance event payloads
export interface BalanceUpdatedPayload extends BaseEventPayload {
  groupId: string;
  balances: {
    userId: string;
    balance: number;
    owes: number;
    owed: number;
  }[];
}

// Socket acknowledgment response
export interface AckResponse {
  success: boolean;
  error?: string;
  data?: any;
}

// Socket user data
export interface SocketUserData {
  userId: string;
  email: string;
  name: string;
}
