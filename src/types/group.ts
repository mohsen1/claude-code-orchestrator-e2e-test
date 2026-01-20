/**
 * Group type definitions for SplitSync
 * Groups are the core organizational unit for expense sharing
 */

import { CurrencyCode } from './currency';
import type { UserId, GroupRole } from './user';

/**
 * Unique identifier for groups (UUID v4)
 */
export type GroupId = string;

/**
 * Group invite status
 */
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

/**
 * Group visibility settings
 */
export type GroupVisibility = 'public' | 'private' | 'invite-only';

/**
 * Group settings
 */
export interface GroupSettings {
  allowMemberInvite: boolean;
  requireApprovalForExpenses: boolean;
  defaultSplitEqual: boolean;
  currencyConversionEnabled: boolean;
}

/**
 * Expense category within a group
 */
export interface ExpenseCategory {
  id: string;
  groupId: GroupId;
  name: string;
  color: string; // Hex color code
  icon: string; // Emoji or icon name
  isDefault: boolean;
  createdAt: Date;
}

/**
 * Complete group information
 */
export interface Group {
  id: GroupId;
  name: string;
  description: string | null;
  currency: CurrencyCode;
  createdBy: UserId;
  settings: GroupSettings;
  visibility: GroupVisibility;
  memberCount: number;
  totalExpenses: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

/**
 * Group data for creation
 */
export interface GroupCreateInput {
  name: string;
  description?: string | null;
  currency?: CurrencyCode;
  settings?: Partial<GroupSettings>;
  visibility?: GroupVisibility;
}

/**
 * Group data for updates
 */
export interface GroupUpdateInput {
  name?: string;
  description?: string | null;
  settings?: Partial<GroupSettings>;
  visibility?: GroupVisibility;
  archivedAt?: Date | null;
}

/**
 * Minimal group info for displays
 */
export interface GroupMinimal {
  id: GroupId;
  name: string;
  currency: CurrencyCode;
  memberCount: number;
  updatedAt: Date;
}

/**
 * Group membership information
 */
export interface GroupMember {
  groupId: GroupId;
  userId: UserId;
  role: GroupRole;
  joinedAt: Date;
  invitedBy: UserId | null;
  balance: number; // User's net balance in this group (monetary amount)
  totalPaid: number; // Total amount paid by user (monetary amount)
  totalShare: number; // Total amount user owes (monetary amount)
}

/**
 * Group member with user details
 */
export interface GroupMemberWithUser extends GroupMember {
  user: {
    id: UserId;
    name: string;
    email: string;
    image: string | null;
  };
}

/**
 * Group invite link
 */
export interface GroupInvite {
  id: string;
  groupId: GroupId;
  code: string; // Unique invite code
  createdBy: UserId;
  maxUses: number | null; // null = unlimited
  useCount: number;
  expiresAt: Date | null; // null = never expires
  createdAt: Date;
  valid: boolean; // Calculated field: true if not expired and under max uses
}

/**
 * Group invite creation options
 */
export interface GroupInviteCreateInput {
  maxUses?: number | null;
  expiresIn?: number | null; // Duration in seconds, null = never expires
}

/**
 * Detailed group information with members
 */
export interface GroupWithMembers extends Group {
  members: GroupMemberWithUser[];
  categories: ExpenseCategory[];
}

/**
 * Group statistics
 */
export interface GroupStatistics {
  groupId: GroupId;
  totalExpenses: number;
  totalAmount: number; // Monetary amount
  averageExpenseAmount: number; // Monetary amount
  largestExpense: number; // Monetary amount
  mostActiveCategory: {
    categoryId: string;
    categoryName: string;
    expenseCount: number;
    totalAmount: number;
  } | null;
  memberCount: number;
  settlementCount: number;
  unsettledAmount: number; // Total unsettled amount (monetary amount)
}

/**
 * Group balance summary
 */
export interface GroupBalanceSummary {
  groupId: GroupId;
  members: {
    userId: UserId;
    userName: string;
    balance: number; // Net balance (monetary amount)
    isPositive: boolean; // true = owed money, false = owes money
  }[];
  totalSettled: number; // Total settled amount (monetary amount)
  totalUnsettled: number; // Total unsettled amount (monetary amount)
}

/**
 * Type guard to check if group is archived
 */
export function isGroupArchived(group: Group): boolean {
  return group.archivedAt !== null;
}

/**
 * Type guard to check if user can invite others
 */
export function canUserInvite(group: Group, userRole: GroupRole): boolean {
  return group.settings.allowMemberInvite || userRole === 'admin';
}

/**
 * Type guard to check if invite is valid
 */
export function isInviteValid(invite: GroupInvite): boolean {
  if (invite.maxUses !== null && invite.useCount >= invite.maxUses) {
    return false;
  }

  if (invite.expiresAt !== null && new Date() > invite.expiresAt) {
    return false;
  }

  return true;
}

/**
 * Calculate group member balances
 */
export interface MemberBalances {
  [userId: string]: {
    paid: number; // Amount paid
    owes: number; // Amount owes
    balance: number; // Net balance (positive = owed, negative = owes)
  };
}

/**
 * Group activity feed item
 */
export interface GroupActivity {
  id: string;
  groupId: GroupId;
  type: 'expense_created' | 'expense_updated' | 'expense_deleted' | 'member_joined' | 'member_left' | 'settlement_created';
  userId: UserId | null;
  data: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Paged result for group activities
 */
export interface GroupActivitiesResponse {
  activities: GroupActivity[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
