/**
 * Group data models and interfaces for expense sharing application
 */

export type GroupRole = 'owner' | 'admin' | 'member';
export type MemberStatus = 'pending' | 'accepted' | 'declined';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

/**
 * Group entity representing an expense sharing group
 */
export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: number;
  updated_at: number;
  is_archived: boolean;
}

/**
 * Group member representation
 */
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: number;
  status: MemberStatus;
}

/**
 * Group invitation for new members
 */
export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_by: string;
  invitee_email: string;
  status: InvitationStatus;
  created_at: number;
  expires_at: number;
  token: string;
}

/**
 * Group with associated member count
 */
export interface GroupWithMemberCount extends Group {
  member_count: number;
}

/**
 * Group with full member details
 */
export interface GroupWithMembers extends Group {
  members: Array<GroupMember & {
    user_name?: string;
    user_email?: string;
    user_avatar?: string;
  }>;
}

/**
 * Group detail with all related information
 */
export interface GroupDetail extends Group {
  members: Array<GroupMember & {
    user_name?: string;
    user_email?: string;
    user_avatar?: string;
  }>;
  pending_invitations: GroupInvitation[];
  total_balance?: number;
  expense_count?: number;
}

/**
 * DTO for creating a new group
 */
export interface CreateGroupDTO {
  name: string;
  description?: string;
  created_by: string;
}

/**
 * DTO for updating a group
 */
export interface UpdateGroupDTO {
  name?: string;
  description?: string;
  is_archived?: boolean;
}

/**
 * DTO for inviting a member to a group
 */
export interface InviteMemberDTO {
  group_id: string;
  invitee_email: string;
  invited_by: string;
  expires_in_days?: number; // Default: 7 days
}

/**
 * DTO for updating member role
 */
export interface UpdateMemberRoleDTO {
  group_id: string;
  user_id: string;
  role: GroupRole;
}

/**
 * DTO for accepting/declining invitation
 */
export interface RespondToInvitationDTO {
  token: string;
  user_id: string;
  action: 'accept' | 'decline';
}

/**
 * Result of group creation operation
 */
export interface GroupCreationResult {
  success: boolean;
  group?: Group;
  owner_member?: GroupMember;
  error?: string;
}

/**
 * Result of member invitation
 */
export interface InvitationResult {
  success: boolean;
  invitation?: GroupInvitation;
  error?: string;
}

/**
 * Result of joining a group
 */
export interface JoinGroupResult {
  success: boolean;
  member?: GroupMember;
  group?: Group;
  error?: string;
}

/**
 * Group statistics
 */
export interface GroupStatistics {
  total_members: number;
  active_members: number;
  pending_invitations: number;
  total_expenses: number;
  total_amount: number;
  created_at: number;
}

/**
 * Member information with user details
 */
export interface MemberWithUserInfo extends GroupMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}
