/**
 * Settlement type definitions
 * Represents settlements between users in the SplitSync application
 */

export type SettlementStatus = 'pending' | 'completed' | 'cancelled';

/**
 * Core Settlement entity
 * Represents a payment from one user to another
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // In cents - must be positive
  status: SettlementStatus;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Settlement with user details
 */
export interface SettlementWithDetails extends Settlement {
  fromUser: {
    id: string;
    name: string;
    image?: string | null;
  };
  toUser: {
    id: string;
    name: string;
    image?: string | null;
  };
  group: {
    id: string;
    name: string;
    currency: string;
  };
}

/**
 * Simplified debt graph edge
 * Shows net debt between two users after optimization
 */
export interface DebtEdge {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number; // In cents - positive amount owed
}

/**
 * Settlement creation input
 */
export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // In cents
}

/**
 * Settlement update input
 */
export interface UpdateSettlementInput {
  status?: SettlementStatus;
  completedAt?: Date | null;
}

/**
 * Balance calculation result for a user in a group
 */
export interface UserBalance {
  userId: string;
  userName: string;
  balance: number; // Net balance in cents (positive = owed money, negative = owes money)
  totalPaid: number; // Total paid in cents
  totalOwed: number; // Total owed in cents
}

/**
 * Settlement plan - optimized list of payments to settle all debts
 */
export interface SettlementPlan {
  groupId: string;
  currency: string;
  totalAmount: number; // Total amount to be settled in cents
  transactions: Array<{
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number; // In cents
  }>;
  timestamp: Date;
}

/**
 * Settlement statistics for a group
 */
export interface SettlementStats {
  totalSettlements: number;
  completedSettlements: number;
  pendingSettlements: number;
  totalSettled: number; // In cents
  averageSettlement: number; // In cents
}
