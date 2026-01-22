import type { BaseEntity, CurrencyCode, GroupRole, PublicUserProfile } from './index';

// ============================================================================
// GROUP TYPES
// ============================================================================

/**
 * Group entity from database
 */
export interface Group extends BaseEntity {
  name: string;
  description: string | null;
  currency: CurrencyCode;
  createdBy: string;
  archivedAt: Date | null;
  deletedAt: Date | null;
}

/**
 * Group with related data included
 */
export interface GroupWithDetails extends Group {
  members: GroupMember[];
  memberCount: number;
  totalExpenses: number;
  totalSettled: number;
  currentUserRole?: GroupRole;
  currentUserBalance?: number;
}

/**
 * Group member (user in a group with specific role)
 */
export interface GroupMember extends BaseEntity {
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  invitedBy: string | null;
  user: PublicUserProfile;
}

/**
 * Group member creation input
 */
export interface AddGroupMemberInput {
  groupId: string;
  userId: string;
  role?: GroupRole;
  invitedBy: string;
}

/**
 * Group member update input
 */
export interface UpdateGroupMemberInput {
  role?: GroupRole;
}

/**
 * Group creation input
 */
export interface CreateGroupInput {
  name: string;
  description?: string;
  currency: CurrencyCode;
  memberIds: string[]; // User IDs to add as members (excluding creator)
}

/**
 * Group update input
 */
export interface UpdateGroupInput {
  name?: string;
  description?: string | null;
  currency?: CurrencyCode;
  defaultSplitOptions?: DefaultSplitOptions;
}

/**
 * Default split options for new expenses
 */
export interface DefaultSplitOptions {
  type: 'equal' | 'custom';
  excludeInactiveMembers?: boolean;
}

/**
 * Group invite link
 */
export interface GroupInviteLink extends BaseEntity {
  groupId: string;
  token: string;
  createdBy: string;
  expiresAt: Date | null;
  maxUses: number | null;
  useCount: number;
  role: GroupRole;
  isActive: boolean;
}

/**
 * Group invite link creation input
 */
export interface CreateInviteLinkInput {
  groupId: string;
  expiresAt?: Date;
  maxUses?: number;
  role?: GroupRole;
}

/**
 * Group invite link validation result
 */
export interface ValidateInviteLinkResult {
  valid: boolean;
  group?: GroupWithDetails;
  error?: string;
  errorCode?: 'EXPIRED' | 'MAX_USES_REACHED' | 'INVALID' | 'ALREADY_MEMBER';
}

/**
 * Group statistics
 */
export interface GroupStats {
  memberCount: number;
  expenseCount: number;
  totalExpenses: number;
  totalSettled: number;
  pendingSettlements: number;
  averageExpensePerMember: number;
  largestExpense: number;
  smallestExpense: number;
  mostActiveSpender: {
    userId: string;
    userName: string;
    totalSpent: number;
  };
  categoryBreakdown: CategorySpending[];
}

/**
 * Category spending breakdown
 */
export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

/**
 * Group member balance
 */
export interface MemberBalance {
  userId: string;
  userName: string;
  userImage: string | null;
  balance: number; // Positive = owed money, Negative = owes money
  totalPaid: number;
  totalOwed: number;
  expenseCount: number;
}

/**
 * Group activity log
 */
export interface GroupActivityLog extends BaseEntity {
  groupId: string;
  userId: string;
  action: GroupActivityAction;
  metadata: Record<string, unknown> | null;
}

/**
 * Group activity actions
 */
export type GroupActivityAction =
  | 'group_created'
  | 'group_updated'
  | 'group_archived'
  | 'group_restored'
  | 'group_deleted'
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  | 'invite_link_created'
  | 'invite_link_used'
  | 'settings_updated';

/**
 * Group settings
 */
export interface GroupSettings {
  currency: CurrencyCode;
  defaultSplitType: 'equal' | 'exact' | 'percentage';
  allowCustomSplits: boolean;
  requireReceiptForExpensesAbove: number | null;
  autoArchiveAfterDays: number | null;
  allowMemberInvite: boolean;
  allowMemberRemoval: boolean;
  notifyOnExpenseAdded: boolean;
  notifyOnSettlementCompleted: boolean;
}

/**
 * Group filters for queries
 */
export interface GroupFilters {
  archived?: boolean;
  deleted?: boolean;
  createdBy?: string;
  memberUserId?: string; // Groups where user is a member
  currency?: CurrencyCode;
  searchTerm?: string;
  minMembers?: number;
  maxMembers?: number;
}

/**
 * Group query parameters
 */
export interface GroupQueryParams {
  filters: GroupFilters;
  pagination: {
    page: number;
    pageSize: number;
  };
  sort: {
    field: 'name' | 'createdAt' | 'memberCount' | 'totalExpenses';
    order: 'asc' | 'desc';
  };
}

/**
 * Group summary for list views
 */
export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  currency: CurrencyCode;
  memberCount: number;
  expenseCount: number;
  currentUserRole: GroupRole;
  currentUserBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group export format
 */
export interface GroupExport {
  group: Group;
  members: Array<{
    user: PublicUserProfile;
    role: GroupRole;
    joinedAt: Date;
  }>;
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    currency: CurrencyCode;
    date: Date;
    paidBy: PublicUserProfile;
    category: string;
  }>;
  settlements: Array<{
    id: string;
    from: PublicUserProfile;
    to: PublicUserProfile;
    amount: number;
    status: string;
  }>;
}

/**
 * Group invitation status
 */
export type GroupInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

/**
 * Group invitation (sent to specific users)
 */
export interface GroupInvitation extends BaseEntity {
  groupId: string;
  invitedBy: string;
  invitedUserId: string;
  status: GroupInvitationStatus;
  expiresAt: Date;
  respondedAt: Date | null;
}

/**
 * Group membership request
 */
export interface GroupMembershipRequest extends BaseEntity {
  groupId: string;
  userId: string;
  message: string | null;
  status: 'pending' | 'approved' | 'declined';
  respondedBy: string | null;
  respondedAt: Date | null;
}

/**
 * Group notification settings per user
 */
export interface GroupNotificationSettings {
  groupId: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyOnExpenseAdded: boolean;
  notifyOnSettlementCompleted: boolean;
  notifyOnMemberJoined: boolean;
  notifyOnMemberLeft: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
}

/**
 * Group category (custom categories per group)
 */
export interface GroupCategory extends BaseEntity {
  groupId: string;
  name: string;
  icon: string | null;
  color: string | null;
  budget: number | null; // Monthly budget for this category
  isActive: boolean;
}

/**
 * Group budget
 */
export interface GroupBudget extends BaseEntity {
  groupId: string;
  category: string | null; // null = overall budget
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  alertThreshold: number; // Percentage (0-100) to trigger alert
  isActive: boolean;
}

/**
 * Group budget status
 */
export interface GroupBudgetStatus {
  budget: GroupBudget;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  alertTriggered: boolean;
  periodStart: Date;
  periodEnd: Date;
}
