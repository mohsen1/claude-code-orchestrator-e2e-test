/**
 * Group type definitions
 * Represents a group in the SplitSync application
 */

export type GroupRole = 'admin' | 'member';

/**
 * Core Group entity
 */
export interface Group {
  id: string;
  name: string;
  currency: string; // ISO 4217 currency code (e.g., 'USD', 'EUR')
  createdBy: string; // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group member information
 */
export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

/**
 * Group creation input
 */
export interface CreateGroupInput {
  name: string;
  currency?: string; // Defaults to 'USD'
}

/**
 * Group update input
 */
export interface UpdateGroupInput {
  name?: string;
  currency?: string;
}

/**
 * Group with members and statistics
 */
export interface GroupWithDetails extends Group {
  memberCount: number;
  expenseCount: number;
  totalExpenses: number; // In cents
  members: GroupMember[];
}

/**
 * Group invite link information
 */
export interface GroupInvite {
  id: string;
  groupId: string;
  code: string;
  createdBy: string; // User ID
  maxUses?: number | null;
  expiresAt?: Date | null;
  useCount: number;
  createdAt: Date;
}

/**
 * Group invite creation input
 */
export interface CreateGroupInviteInput {
  groupId: string;
  maxUses?: number;
  expiresInDays?: number; // Defaults to 7 days
}

/**
 * Group balance summary
 */
export interface GroupBalanceSummary {
  groupId: string;
  groupName: string;
  currency: string;
  totalExpenses: number; // In cents
  memberBalances: {
    userId: string;
    userName: string;
    balance: number; // Net balance in cents
    paid: number; // Total paid in cents
    owes: number; // Total owes in cents
  }[];
}
