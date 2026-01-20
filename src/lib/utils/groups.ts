import { GroupsDatabase } from '@/lib/db/groups';
import { Group, GroupMember, GroupInvitation } from '@/lib/types/groups';

/**
 * Check if a user has permission to perform an action on a group
 */
export function hasGroupPermission(
  groupsDb: GroupsDatabase,
  groupId: string,
  userId: string,
  action: 'view' | 'update' | 'delete' | 'admin' | 'invite'
): boolean {
  const isMember = groupsDb.isUserMemberOfGroup(groupId, userId);
  if (!isMember) {
    return false;
  }

  const isAdmin = groupsDb.isUserGroupAdmin(groupId, userId);

  switch (action) {
    case 'view':
      return true;
    case 'update':
    case 'delete':
    case 'admin':
    case 'invite':
      return isAdmin;
    default:
      return false;
  }
}

/**
 * Validate group name
 */
export function validateGroupName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Group name is required' };
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Group name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Group name must be less than 100 characters' };
  }

  return { valid: true };
}

/**
 * Validate group description
 */
export function validateGroupDescription(description: string): { valid: boolean; error?: string } {
  if (!description) {
    return { valid: true };
  }

  if (typeof description !== 'string') {
    return { valid: false, error: 'Description must be a string' };
  }

  if (description.length > 500) {
    return { valid: false, error: 'Description must be less than 500 characters' };
  }

  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate invitation expiration time
 */
export function validateExpirationHours(hours: number): { valid: boolean; error?: string } {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return { valid: false, error: 'Expiration time must be a number' };
  }

  if (hours < 1) {
    return { valid: false, error: 'Expiration time must be at least 1 hour' };
  }

  if (hours > 168) {
    return { valid: false, error: 'Expiration time cannot exceed 168 hours (1 week)' };
  }

  return { valid: true };
}

/**
 * Format group data for API response
 */
export function formatGroupResponse(
  group: Group,
  stats: { memberCount: number; pendingInvitations: number },
  currentUserRole?: 'admin' | 'member'
) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    created_by: group.created_by,
    created_at: group.created_at,
    updated_at: group.updated_at,
    memberCount: stats.memberCount,
    pendingInvitations: stats.pendingInvitations,
    currentUserRole: currentUserRole || 'member',
  };
}

/**
 * Format member data for API response
 */
export function formatMemberResponse(member: GroupMember) {
  return {
    id: member.id,
    group_id: member.group_id,
    user_id: member.user_id,
    role: member.role,
    status: member.status,
    joined_at: member.joined_at,
    updated_at: member.updated_at,
  };
}

/**
 * Format invitation data for API response
 */
export function formatInvitationResponse(
  invitation: GroupInvitation,
  groupDetails?: { name: string; description?: string }
) {
  return {
    id: invitation.id,
    group_id: invitation.group_id,
    group_name: groupDetails?.name,
    group_description: groupDetails?.description,
    email: invitation.email,
    invited_by: invitation.invited_by,
    status: invitation.status,
    created_at: invitation.created_at,
    expires_at: invitation.expires_at,
    updated_at: invitation.updated_at,
  };
}

/**
 * Calculate invitation expiration time
 */
export function calculateExpirationTime(hours: number): number {
  return Date.now() + (hours * 60 * 60 * 1000);
}

/**
 * Check if invitation has expired
 */
export function isInvitationExpired(invitation: GroupInvitation): boolean {
  return Date.now() > invitation.expires_at;
}

/**
 * Generate invitation link
 */
export function generateInvitationLink(invitationId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/invite/${invitationId}`;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validate role
 */
export function validateRole(role: string): { valid: boolean; error?: string } {
  if (role !== 'admin' && role !== 'member') {
    return { valid: false, error: 'Role must be either admin or member' };
  }
  return { valid: true };
}

/**
 * Check if member is the last admin
 */
export function isLastAdmin(
  groupsDb: GroupsDatabase,
  groupId: string,
  memberId: string
): boolean {
  const members = groupsDb.getGroupMembers(groupId);
  const member = members.find((m) => m.id === memberId);

  if (!member || member.role !== 'admin') {
    return false;
  }

  const adminCount = members.filter((m) => m.role === 'admin').length;
  return adminCount <= 1;
}
