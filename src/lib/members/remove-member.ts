import { database } from '@/lib/database';
import { getMemberRole, canRemoveMember } from './authorize';

export interface RemoveMemberResult {
  success: boolean;
  message: string;
}

export async function removeMemberFromGroup(
  groupId: string,
  userId: string,
  requesterId: string
): Promise<RemoveMemberResult> {
  try {
    // Check if requester is a member
    const requesterRole = await getMemberRole(groupId, requesterId);
    if (!requesterRole) {
      return {
        success: false,
        message: 'You are not a member of this group'
      };
    }

    // Get target user's role
    const targetRole = await getMemberRole(groupId, userId);
    if (!targetRole) {
      return {
        success: false,
        message: 'User is not a member of this group'
      };
    }

    // Check if requester can remove this member
    if (!canRemoveMember(requesterRole, targetRole)) {
      return {
        success: false,
        message: 'You do not have permission to remove this member'
      };
    }

    // Prevent the last owner from leaving
    if (targetRole === 'owner') {
      const ownerCount = database.prepare(`
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = ? AND role = 'owner'
      `).get(groupId) as { count: number };

      if (ownerCount.count <= 1) {
        return {
          success: false,
          message: 'Cannot remove the last owner from the group'
        };
      }
    }

    // Remove the member
    database.prepare(`
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `).run(groupId, userId);

    return {
      success: true,
      message: 'Member removed successfully'
    };
  } catch (error) {
    console.error('Error removing member from group:', error);
    return {
      success: false,
      message: 'Failed to remove member from group'
    };
  }
}

export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<RemoveMemberResult> {
  try {
    // Check if user is a member
    const memberRole = await getMemberRole(groupId, userId);
    if (!memberRole) {
      return {
        success: false,
        message: 'You are not a member of this group'
      };
    }

    // Prevent the last owner from leaving
    if (memberRole === 'owner') {
      const ownerCount = database.prepare(`
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = ? AND role = 'owner'
      `).get(groupId) as { count: number };

      if (ownerCount.count <= 1) {
        return {
          success: false,
          message: 'Cannot leave the group as the last owner. Transfer ownership or add another owner first.'
        };
      }
    }

    // Remove the member
    database.prepare(`
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `).run(groupId, userId);

    return {
      success: true,
      message: 'Successfully left the group'
    };
  } catch (error) {
    console.error('Error leaving group:', error);
    return {
      success: false,
      message: 'Failed to leave the group'
    };
  }
}
