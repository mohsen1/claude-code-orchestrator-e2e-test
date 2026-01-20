import { database } from '@/lib/database';
import { isGroupAdmin, isGroupMember } from './authorize';

export interface AddMemberResult {
  success: boolean;
  message: string;
  member?: {
    user_id: string;
    role: string;
    added_at: string;
  };
}

export async function addMemberToGroup(
  groupId: string,
  userId: string,
  requesterId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<AddMemberResult> {
  try {
    // Check if requester is a group admin or owner
    const isAdmin = await isGroupAdmin(groupId, requesterId);
    if (!isAdmin) {
      return {
        success: false,
        message: 'You do not have permission to add members to this group'
      };
    }

    // Only owners can add other owners
    const requesterRole = await database.prepare(`
      SELECT role FROM group_members
      WHERE group_id = ? AND user_id = ?
    `).get(groupId, requesterId) as { role: string } | undefined;

    if (role === 'owner' && requesterRole?.role !== 'owner') {
      return {
        success: false,
        message: 'Only group owners can add other owners'
      };
    }

    // Check if user is already a member
    const existingMember = await isGroupMember(groupId, userId);
    if (existingMember) {
      return {
        success: false,
        message: 'User is already a member of this group'
      };
    }

    // Add the member
    const addedAt = new Date().toISOString();
    database.prepare(`
      INSERT INTO group_members (group_id, user_id, role, added_at)
      VALUES (?, ?, ?, ?)
    `).run(groupId, userId, role, addedAt);

    return {
      success: true,
      message: 'Member added successfully',
      member: {
        user_id: userId,
        role,
        added_at: addedAt
      }
    };
  } catch (error) {
    console.error('Error adding member to group:', error);
    return {
      success: false,
      message: 'Failed to add member to group'
    };
  }
}

export async function addMultipleMembersToGroup(
  groupId: string,
  userIds: string[],
  requesterId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<{ success: boolean; message: string; results: AddMemberResult[] }> {
  const results = await Promise.all(
    userIds.map(userId => addMemberToGroup(groupId, userId, requesterId, role))
  );

  const successCount = results.filter(r => r.success).length;
  const message = successCount === userIds.length
    ? `Successfully added ${successCount} members`
    : `Added ${successCount} out of ${userIds.length} members`;

  return {
    success: successCount > 0,
    message,
    results
  };
}
