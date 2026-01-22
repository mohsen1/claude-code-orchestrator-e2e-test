import type { CurrencyCode } from './expense';

// Group types
export type GroupRole = 'admin' | 'member';
export type GroupStatus = 'active' | 'archived' | 'deleted';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  currency: CurrencyCode;
  createdBy: string; // User ID
  status: GroupStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  deletedAt: Date | null;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  invitedBy: string | null; // User ID who invited
  leftAt: Date | null;
}

export interface GroupWithMembers extends Group {
  members: Array<
    GroupMember & {
      user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
      };
    }
  >;
  memberCount: number;
  totalExpenses: number;
  totalSettlements: number;
}

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  currency: CurrencyCode;
  memberCount: number;
  totalExpenses: number;
  yourBalance: number; // For current user
  status: GroupStatus;
  updatedAt: Date;
}

// Group DTOs
export interface CreateGroupInput {
  name: string;
  description?: string;
  currency: CurrencyCode;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string | null;
  currency?: CurrencyCode;
  status?: GroupStatus;
}

export interface InviteMemberInput {
  groupId: string;
  email: string;
  role?: GroupRole;
}

export interface InviteLink {
  id: string;
  groupId: string;
  token: string;
  createdBy: string; // User ID
  expiresAt: Date;
  maxUses: number | null;
  useCount: number;
  createdAt: Date;
}

export interface InviteLinkDetails {
  token: string;
  group: {
    id: string;
    name: string;
    description: string | null;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
  expiresAt: Date;
  maxUses: number | null;
  useCount: number;
}

export interface GroupInviteStats {
  pendingInvites: number;
  totalMembers: number;
  activeMembers: number;
}

// Group validation
export function validateGroupName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= 100;
}

export function validateGroupDescription(description: string | null | undefined): boolean {
  if (!description) return true;
  return description.trim().length <= 500;
}

export function canUserModifyGroup(userRole: GroupRole): boolean {
  return userRole === 'admin';
}

export function canUserInviteMembers(userRole: GroupRole): boolean {
  return userRole === 'admin';
}

export function canUserRemoveMember(userRole: GroupRole, targetUserId: string, currentUserId: string): boolean {
  // Admins can remove anyone except themselves
  // Members cannot remove anyone
  if (userRole !== 'admin') return false;
  if (targetUserId === currentUserId) return false;
  return true;
}

export function canUserArchiveGroup(userRole: GroupRole): boolean {
  return userRole === 'admin';
}

export function canUserDeleteGroup(userRole: GroupRole): boolean {
  return userRole === 'admin';
}

// Group activity types
export type GroupActivityType =
  | 'group_created'
  | 'group_updated'
  | 'group_archived'
  | 'member_joined'
  | 'member_left'
  | 'member_removed'
  | 'member_role_changed'
  | 'expense_added'
  | 'expense_updated'
  | 'expense_deleted'
  | 'settlement_created'
  | 'settlement_completed';

export interface GroupActivity {
  id: string;
  groupId: string;
  type: GroupActivityType;
  userId: string | null;
  data: Record<string, unknown>;
  createdAt: Date;
}
