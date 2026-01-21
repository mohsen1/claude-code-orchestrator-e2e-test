/**
 * Group-related types and interfaces
 */

import { UUID } from './api';
import { User } from './user';

/**
 * Supported currencies for expense tracking
 */
export type Currency =
  | 'USD'  // US Dollar
  | 'EUR'  // Euro
  | 'GBP'  // British Pound
  | 'JPY'  // Japanese Yen
  | 'CAD'  // Canadian Dollar
  | 'AUD'  // Australian Dollar
  | 'CHF'  // Swiss Franc
  | 'CNY'  // Chinese Yuan
  | 'INR'; // Indian Rupee

/**
 * Group entity representation
 */
export interface Group {
  id: UUID;
  name: string;
  currency: Currency;
  createdBy: UUID;
  createdAt: Date;
}

/**
 * Group member roles
 */
export type GroupRole = 'admin' | 'member';

/**
 * Group membership with role information
 */
export interface GroupMember {
  groupId: UUID;
  userId: UUID;
  role: GroupRole;
  joinedAt: Date;
  user?: User; // Populated when including user details
}

/**
 * Group creation payload
 */
export interface CreateGroupInput {
  name: string;
  currency?: Currency;
}

/**
 * Group update payload
 */
export interface UpdateGroupInput {
  name?: string;
  currency?: Currency;
}

/**
 * Group with membership information
 */
export interface GroupWithMembers extends Group {
  members: Array<GroupMember & { user: User }>;
  memberCount: number;
}

/**
 * Group invite link information
 */
export interface GroupInvite {
  groupId: UUID;
  inviteCode: string;
  expiresAt: Date;
  maxUses?: number;
  useCount: number;
  createdBy: UUID;
}
