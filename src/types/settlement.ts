/**
 * Settlement and balance-related types
 */

import { UUID } from './api';

/**
 * Settlement status
 */
export type SettlementStatus = 'pending' | 'completed' | 'cancelled';

/**
 * Settlement record representing a payment between users
 */
export interface Settlement {
  id: UUID;
  groupId: UUID;
  fromUserId: UUID; // User who owes money
  toUserId: UUID;   // User who is owed money
  amount: number;   // Amount in cents (must be positive)
  status: SettlementStatus;
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

/**
 * User balance within a group
 * Positive = user is owed money (net creditor)
 * Negative = user owes money (net debtor)
 */
export interface UserBalance {
  userId: UUID;
  userName: string;
  userImage?: string | null;
  balance: number; // In cents
}

/**
 * Simplified debt relationship
 * Represents who should pay whom and how much
 */
export interface DebtRelation {
  fromUserId: UUID;
  fromUserName: string;
  toUserId: UUID;
  toUserName: string;
  amount: number; // In cents (must be positive)
}

/**
 * Settlement creation payload
 */
export interface CreateSettlementInput {
  groupId: UUID;
  fromUserId: UUID;
  toUserId: UUID;
  amount: number; // In cents (must be positive)
  notes?: string;
}

/**
 * Settlement update payload
 */
export interface UpdateSettlementInput {
  status?: SettlementStatus;
  completedAt?: Date;
  notes?: string;
}

/**
 * Group settlement summary
 * Shows all pending and completed settlements for a group
 */
export interface GroupSettlementSummary {
  groupId: UUID;
  pendingSettlements: Settlement[];
  completedSettlements: Settlement[];
  totalPendingAmount: number;
}
