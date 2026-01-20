/**
 * Business logic layer for group operations
 * Handles validation, permissions, and complex workflows
 */

import { GroupDatabase } from '../groups';
import {
  CreateGroupDTO,
  UpdateGroupDTO,
  InviteMemberDTO,
  UpdateMemberRoleDTO,
  RespondToInvitationDTO,
  GroupCreationResult,
  InvitationResult,
  JoinGroupResult,
  GroupDetail,
  GroupWithMemberCount,
  GroupStatistics,
  GroupRole,
  MemberStatus,
  InvitationStatus,
} from '../../models/Group';

export class GroupQueries {
  private db: GroupDatabase;

  constructor(db: GroupDatabase) {
    this.db = db;
  }

  /**
   * Create a new expense group
   */
  async createGroup(dto: CreateGroupDTO): Promise<GroupCreationResult> {
    try {
      // Validate input
      if (!dto.name || dto.name.trim().length === 0) {
        return { success: false, error: 'Group name is required' };
      }

      if (dto.name.length > 100) {
        return { success: false, error: 'Group name must be less than 100 characters' };
      }

      if (dto.description && dto.description.length > 500) {
        return { success: false, error: 'Description must be less than 500 characters' };
      }

      // Create group
      const group = this.db.createGroup(dto);
      const ownerMember = this.db.getMemberByGroupAndUser(group.id, dto.created_by);

      return {
        success: true,
        group,
        owner_member: ownerMember!,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create group',
      };
    }
  }

  /**
   * Get group details with full member information
   */
  getGroupDetail(groupId: string): GroupDetail | null {
    const group = this.db.getGroupDetail(groupId);
    if (!group) return null;

    const pendingInvitations = this.db.getPendingInvitationsForGroup(groupId);

    return {
      ...group,
      pending_invitations: pendingInvitations,
    };
  }

  /**
   * Update group information
   */
  updateGroup(groupId: string, userId: string, dto: UpdateGroupDTO): { success: boolean; group?: any; error?: string } {
    try {
      // Check permissions
      if (!this.db.canUserManageGroup(groupId, userId)) {
        return { success: false, error: 'You do not have permission to update this group' };
      }

      // Validate input
      if (dto.name !== undefined) {
        if (dto.name.trim().length === 0) {
          return { success: false, error: 'Group name cannot be empty' };
        }
        if (dto.name.length > 100) {
          return { success: false, error: 'Group name must be less than 100 characters' };
        }
      }

      if (dto.description !== undefined && dto.description.length > 500) {
        return { success: false, error: 'Description must be less than 500 characters' };
      }

      const group = this.db.updateGroup(groupId, dto);
      return { success: true, group };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update group',
      };
    }
  }

  /**
   * Delete/archive a group
   */
  deleteGroup(groupId: string, userId: string): { success: boolean; error?: string } {
    try {
      const group = this.db.getGroupById(groupId);
      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      // Only owner can delete group
      if (group.created_by !== userId) {
        return { success: false, error: 'Only the group owner can delete the group' };
      }

      this.db.deleteGroup(groupId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete group',
      };
    }
  }

  /**
   * Invite a member to the group
   */
  inviteMember(dto: InviteMemberDTO): InvitationResult {
    try {
      // Validate group exists
      const group = this.db.getGroupById(dto.group_id);
      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      // Check permissions
      if (!this.db.canUserManageGroup(dto.group_id, dto.invited_by)) {
        return { success: false, error: 'You do not have permission to invite members' };
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.invitee_email)) {
        return { success: false, error: 'Invalid email address' };
      }

      // Check if user is already a member
      const existingMembers = this.db.getGroupMembers(dto.group_id);
      const isAlreadyMember = existingMembers.some(m => {
        // This would need user lookup - for now check invitations
        const existingInvites = this.db.getPendingInvitationsForGroup(dto.group_id);
        return existingInvites.some(i => i.invitee_email.toLowerCase() === dto.invitee_email.toLowerCase());
      });

      if (isAlreadyMember) {
        return { success: false, error: 'User is already a member or has a pending invitation' };
      }

      // Create invitation
      const invitation = this.db.createInvitation(dto);
      return { success: true, invitation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invitation',
      };
    }
  }

  /**
   * Respond to a group invitation
   */
  respondToInvitation(dto: RespondToInvitationDTO): JoinGroupResult {
    try {
      // Get invitation
      const invitation = this.db.getInvitationByToken(dto.token);
      if (!invitation) {
        return { success: false, error: 'Invitation not found' };
      }

      // Check if invitation is expired
      const now = Math.floor(Date.now() / 1000);
      if (invitation.expires_at < now) {
        this.db.updateInvitationStatus(dto.token, 'expired');
        return { success: false, error: 'Invitation has expired' };
      }

      // Check if invitation is still pending
      if (invitation.status !== 'pending') {
        return { success: false, error: 'Invitation has already been responded to' };
      }

      // Verify email matches (optional - can be removed for flexibility)
      // This would require user lookup which we don't have yet

      if (dto.action === 'decline') {
        this.db.updateInvitationStatus(dto.token, 'declined');
        return { success: true };
      }

      // Accept invitation
      const group = this.db.getGroupById(invitation.group_id);
      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      // Add user as member
      const member = this.db.addMember({
        group_id: invitation.group_id,
        user_id: dto.user_id,
        role: 'member',
        status: 'accepted',
      });

      // Update invitation status
      this.db.updateInvitationStatus(dto.token, 'accepted');

      return {
        success: true,
        member,
        group,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to respond to invitation',
      };
    }
  }

  /**
   * Update member role
   */
  updateMemberRole(dto: UpdateMemberRoleDTO, requesterId: string): { success: boolean; member?: any; error?: string } {
    try {
      const group = this.db.getGroupById(dto.group_id);
      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      // Only owner can update roles
      if (group.created_by !== requesterId) {
        return { success: false, error: 'Only the group owner can update member roles' };
      }

      // Get member to update
      const member = this.db.getMemberByGroupAndUser(dto.group_id, dto.user_id);
      if (!member) {
        return { success: false, error: 'Member not found' };
      }

      // Cannot change owner role
      if (member.role === 'owner') {
        return { success: false, error: 'Cannot change the owner role' };
      }

      // Update role
      const updatedMember = this.db.updateMemberRole(dto.group_id, dto.user_id, dto.role);
      return { success: true, member: updatedMember };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update member role',
      };
    }
  }

  /**
   * Remove member from group
   */
  removeMember(groupId: string, userId: string, requesterId: string): { success: boolean; error?: string } {
    try {
      const group = this.db.getGroupById(groupId);
      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      const member = this.db.getMemberByGroupAndUser(groupId, userId);
      if (!member) {
        return { success: false, error: 'Member not found' };
      }

      // Check if user has permission (owner/admin or removing themselves)
      const isOwner = group.created_by === requesterId;
      const isAdmin = this.db.canUserManageGroup(groupId, requesterId);
      const isSelf = userId === requesterId;

      if (!isOwner && !isAdmin && !isSelf) {
        return { success: false, error: 'You do not have permission to remove this member' };
      }

      // Cannot remove owner
      if (member.role === 'owner') {
        return { success: false, error: 'Cannot remove the group owner' };
      }

      // Admins cannot remove other admins
      if (isAdmin && !isOwner && member.role === 'admin') {
        return { success: false, error: 'Only the owner can remove admins' };
      }

      this.db.removeMember(groupId, userId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove member',
      };
    }
  }

  /**
   * Leave a group
   */
  leaveGroup(groupId: string, userId: string): { success: boolean; error?: string } {
    try {
      const group = this.db.getGroupById(groupId);
      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      const member = this.db.getMemberByGroupAndUser(groupId, userId);
      if (!member) {
        return { success: false, error: 'You are not a member of this group' };
      }

      // Owner cannot leave their own group
      if (member.role === 'owner') {
        return { success: false, error: 'Group owner cannot leave. Please transfer ownership or delete the group.' };
      }

      this.db.removeMember(groupId, userId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to leave group',
      };
    }
  }

  /**
   * Get all groups for a user
   */
  getUserGroups(userId: string): GroupWithMemberCount[] {
    return this.db.getGroupsByUser(userId);
  }

  /**
   * Get pending invitations for a user
   */
  getPendingInvitationsForUser(email: string) {
    this.db.expireOldInvitations();
    return this.db.getInvitationsForEmail(email);
  }

  /**
   * Get group statistics
   */
  getGroupStatistics(groupId: string): GroupStatistics | null {
    const group = this.db.getGroupById(groupId);
    if (!group) return null;

    const members = this.db.getGroupMembers(groupId);
    const activeMembers = members.filter(m => m.status === 'accepted');
    const pendingInvitations = this.db.getPendingInvitationsForGroup(groupId);

    return {
      total_members: members.length,
      active_members: activeMembers.length,
      pending_invitations: pendingInvitations.length,
      total_expenses: 0, // Will be implemented when expenses are added
      total_amount: 0, // Will be implemented when expenses are added
      created_at: group.created_at,
    };
  }

  /**
   * Search groups by name
   */
  searchGroups(userId: string, query: string): GroupWithMemberCount[] {
    const allGroups = this.db.getGroupsByUser(userId);
    if (!query || query.trim().length === 0) {
      return allGroups;
    }

    const lowerQuery = query.toLowerCase();
    return allGroups.filter(group =>
      group.name.toLowerCase().includes(lowerQuery) ||
      (group.description && group.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Validate if user can access group
   */
  canUserAccessGroup(groupId: string, userId: string): boolean {
    return this.db.isUserMemberOfGroup(groupId, userId);
  }

  /**
   * Validate if user can manage group
   */
  canUserManageGroup(groupId: string, userId: string): boolean {
    return this.db.canUserManageGroup(groupId, userId);
  }

  /**
   * Clean up expired invitations
   */
  cleanupExpiredInvitations(): number {
    return this.db.expireOldInvitations();
  }
}

/**
 * Factory function to create GroupQueries instance
 */
export function createGroupQueries(dbPath: string): GroupQueries {
  const db = new GroupDatabase(dbPath);
  return new GroupQueries(db);
}
