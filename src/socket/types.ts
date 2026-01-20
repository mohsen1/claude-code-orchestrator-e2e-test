// Base types
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitMethod: 'equal' | 'exact' | 'percentage';
  splits: Array<{
    userId: string;
    amount: number;
    percentage?: number;
  }>;
  category?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

interface Balance {
  userId: string;
  amount: number;
  currency: string;
}

interface Activity {
  id: string;
  type: 'expense_created' | 'expense_updated' | 'expense_deleted' | 'settlement_created' | 'settlement_completed' | 'member_joined' | 'member_left';
  userId: string;
  groupId: string;
  data: any;
  createdAt: string;
}

// Client to Server Events
export interface ClientToServerEvents {
  // Group events
  group:join: (groupId: string) => void;
  group:leave: (groupId: string) => void;

  // Expense events
  expense:created: (data: {
    groupId: string;
    expense: Expense;
  }) => void;

  expense:updated: (data: {
    groupId: string;
    expense: Expense;
  }) => void;

  expense:deleted: (data: {
    groupId: string;
    expenseId: string;
  }) => void;

  // Member events
  member:invited: (data: {
    groupId: string;
    member: User;
    groupName: string;
  }) => void;

  member:joined: (data: {
    groupId: string;
    member: User;
  }) => void;

  member:removed: (data: {
    groupId: string;
    memberId: string;
    groupName: string;
  }) => void;

  member:role_updated: (data: {
    groupId: string;
    memberId: string;
    role: 'admin' | 'member';
  }) => void;

  // Balance events
  balance:updated: (data: {
    groupId: string;
    balances: Balance[];
  }) => void;

  // Settlement events
  settlement:created: (data: {
    groupId: string;
    settlement: Settlement;
    groupName: string;
  }) => void;

  settlement:completed: (data: {
    groupId: string;
    settlementId: string;
  }) => void;

  settlement:cancelled: (data: {
    groupId: string;
    settlementId: string;
  }) => void;

  // Activity events
  activity:logged: (data: {
    groupId: string;
    activity: Activity;
  }) => void;

  // Typing indicator
  typing:start: (data: { groupId: string }) => void;
  typing:stop: (data: { groupId: string }) => void;

  // Error handling
  error: (error: Error) => void;
}

// Server to Client Events
export interface ServerToClientEvents {
  // Group events
  group:user_joined: (data: {
    groupId: string;
    userId: string;
    userEmail: string;
    timestamp: string;
  }) => void;

  group:user_left: (data: {
    groupId: string;
    userId: string;
    timestamp: string;
  }) => void;

  group:user_offline: (data: {
    groupId: string;
    userId: string;
    timestamp: string;
  }) => void;

  // Expense events
  expense:created: (data: {
    groupId: string;
    expense: Expense;
    createdBy: string;
    timestamp: string;
  }) => void;

  expense:updated: (data: {
    groupId: string;
    expense: Expense;
    updatedBy: string;
    timestamp: string;
  }) => void;

  expense:deleted: (data: {
    groupId: string;
    expenseId: string;
    deletedBy: string;
    timestamp: string;
  }) => void;

  // Member events
  member:invited: (data: {
    groupId: string;
    member: User;
    invitedBy: string;
    timestamp: string;
  }) => void;

  member:joined: (data: {
    groupId: string;
    member: User;
    timestamp: string;
  }) => void;

  member:removed: (data: {
    groupId: string;
    memberId: string;
    removedBy: string;
    timestamp: string;
  }) => void;

  member:role_updated: (data: {
    groupId: string;
    memberId: string;
    role: 'admin' | 'member';
    updatedBy: string;
    timestamp: string;
  }) => void;

  // Balance events
  balance:updated: (data: {
    groupId: string;
    balances: Balance[];
    timestamp: string;
  }) => void;

  // Settlement events
  settlement:created: (data: {
    groupId: string;
    settlement: Settlement;
    createdBy: string;
    timestamp: string;
  }) => void;

  settlement:completed: (data: {
    groupId: string;
    settlementId: string;
    completedBy: string;
    timestamp: string;
  }) => void;

  settlement:cancelled: (data: {
    groupId: string;
    settlementId: string;
    cancelledBy: string;
    timestamp: string;
  }) => void;

  // Activity events
  activity:logged: (data: {
    groupId: string;
    activity: Activity;
    timestamp: string;
  }) => void;

  // Typing indicator
  typing:indicator: (data: {
    groupId: string;
    userId: string;
    userEmail?: string;
    isTyping: boolean;
  }) => void;

  // Notifications
  notification:new: (notification: {
    type: 'group_invitation' | 'removed_from_group' | 'settlement_created' | 'expense_added';
    groupId: string;
    groupName?: string;
    amount?: number;
    isPayer?: boolean;
    invitedBy?: string;
  }) => void;

  // Error handling
  error: (error: {
    message: string;
    code?: string;
  }) => void;
}
