import { database } from '@/lib/database';
import { getMemberRole, canModifyRole } from './authorize';

export interface UpdateRoleResult {
  success: boolean;
  message: string;
  member?: {
    user_id: string;
    role: string;
  };
}

export async function updateMemberRole(
  groupId: string,
  userId: string,
  newRole: 'owner' | 'admin' | 'member',
  requesterId: string
): Promise<UpdateRoleResult> {
  try {
    // Validate role
    if (!['owner', 'admin', 'member'].includes(newRole)) {
      return {
        success: false,
        message: 'Invalid role. Must be owner, admin, or member'
      };
    }

    // Check if requester is a member
    const requesterRole = await getMemberRole(groupId, requesterId);
    if (!requesterRole) {
      return {
        success: false,
        message: 'You are not a member of this group'
      };
    }

    // Get target user's current role
    const targetRole = await getMemberRole(groupId, userId);
    if (!targetRole) {
      return {
        success: false,
        message: 'User is not a member of this group'
      };
    }

    // Check if requester can modify this role
    if (!canModifyRole(requesterRole, targetRole)) {
      return {
        success: false,
        message: 'You do not have permission to modify this member\'s role'
      };
    }

    // Additional check: only owners can promote to owner
    if (newRole === 'owner' && requesterRole !== 'owner') {
      return {
        success: false,
        message: 'Only owners can promote members to owner'
      };
    }

    // Prevent demoting the last owner
    if (targetRole === 'owner' && newRole !== 'owner') {
      const ownerCount = database.prepare(`
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = ? AND role = 'owner'
      `).get(groupId) as { count: number };

      if (ownerCount.count <= 1) {
        return {
          success: false,
          message: 'Cannot demote the last owner. Add another owner first.'
        };
      }
    }

    // Update the role
    database.prepare(`
      UPDATE group_members
      SET role = ?
      WHERE group_id = ? AND user_id = ?
    `).run(newRole, groupId, userId);

    return {
      success: true,
      message: 'Role updated successfully',
      member: {
        user_id: userId,
        role: newRole
      }
    };
  } catch (error) {
    console.error('Error updating member role:', error);
    return {
      success: false,
      message: 'Failed to update member role'
    };
  }
}

export async function transferOwnership(
  groupId: string,
  fromUserId: string,
  toUserId: string
): Promise<UpdateRoleResult> {
  try {
    // Verify from user is the current owner
    const fromUserRole = await getMemberRole(groupId, fromUserId);
    if (fromUserRole !== 'owner') {
      return {
        success: false,
        message: 'Only the current owner can transfer ownership'
      };
    }

    // Verify to user is a member
    const toUserRole = await getMemberRole(groupId, toUserId);
    if (!toUserRole) {
      return {
        success: false,
        message: 'The new owner must be a current member of the group'
      };
    }

    // Use a transaction to ensure atomicity
    const transferOwnership = database.transaction(() => {
      // Demote current owner to admin
      database.prepare(`
        UPDATE group_members
        SET role = 'admin'
        WHERE group_id = ? AND user_id = ?
      `).run(groupId, fromUserId);

      // Promote new owner
      database.prepare(`
        UPDATE group_members
        SET role = 'owner'
        WHERE group_id = ? AND user_id = ?
      `).run(groupId, toUserId);
    });

    transferOwnership();

    return {
      success: true,
      message: 'Ownership transferred successfully',
      member: {
        user_id: toUserId,
        role: 'owner'
      }
    };
  } catch (error) {
    console.error('Error transferring ownership:', error);
    return {
      success: false,
      message: 'Failed to transfer ownership'
    };
  }
}
