import { NextRequest, NextResponse } from 'next/server';
import {
  getGroupWithMembers,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  updateMemberRole,
  isGroupMember,
  isGroupAdmin,
  getGroupMembers,
} from '@/lib/db/groups';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/groups/[id]
 * Get a specific group by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const groupId = context.params.id;

    // Check if user is a member of the group
    if (!isGroupMember(groupId, userId)) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const group = getGroupWithMembers(groupId);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/groups/[id]
 * Update a group
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const groupId = context.params.id;

    // Check if user is an admin of the group
    if (!isGroupAdmin(groupId, userId)) {
      return NextResponse.json(
        { error: 'Only admins can update the group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Group name cannot be empty' },
          { status: 400 }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Group name must be less than 100 characters' },
          { status: 400 }
        );
      }
    }

    if (description !== undefined && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Update the group
    const updatedGroup = updateGroup(groupId, {
      name: name?.trim(),
      description: description?.trim(),
    });

    if (!updatedGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Fetch the group with members
    const groupWithMembers = getGroupWithMembers(groupId);

    return NextResponse.json({
      group: groupWithMembers,
      message: 'Group updated successfully'
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Delete a group
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const groupId = context.params.id;

    // Check if user is an admin of the group
    if (!isGroupAdmin(groupId, userId)) {
      return NextResponse.json(
        { error: 'Only admins can delete the group' },
        { status: 403 }
      );
    }

    const deleted = deleteGroup(groupId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]
 * Invite a member to the group or perform other group actions
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const groupId = context.params.id;

    // Check if user is a member of the group
    if (!isGroupMember(groupId, userId)) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, user_id, role } = body;

    if (action === 'invite') {
      // Check if user is an admin (only admins can invite)
      if (!isGroupAdmin(groupId, userId)) {
        return NextResponse.json(
          { error: 'Only admins can invite members' },
          { status: 403 }
        );
      }

      if (!user_id) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Check if user is already a member
      if (isGroupMember(groupId, user_id)) {
        return NextResponse.json(
          { error: 'User is already a member of this group' },
          { status: 400 }
        );
      }

      // Add the member
      const member = addMember({
        group_id: groupId,
        user_id,
        role: role || 'member',
      });

      // Get updated group with members
      const groupWithMembers = getGroupWithMembers(groupId);

      return NextResponse.json({
        group: groupWithMembers,
        member,
        message: 'Member added successfully'
      });
    }

    if (action === 'remove_member') {
      // Check if user is an admin (only admins can remove members)
      if (!isGroupAdmin(groupId, userId)) {
        return NextResponse.json(
          { error: 'Only admins can remove members' },
          { status: 403 }
        );
      }

      if (!user_id) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Don't allow removing the last admin
      const members = getGroupMembers(groupId);
      const adminCount = members.filter(m => m.role === 'admin').length;
      const memberToRemove = members.find(m => m.user_id === user_id);

      if (memberToRemove?.role === 'admin' && adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin from the group' },
          { status: 400 }
        );
      }

      // Remove the member
      const removed = removeMember(groupId, user_id);

      if (!removed) {
        return NextResponse.json(
          { error: 'Member not found in group' },
          { status: 404 }
        );
      }

      // Get updated group with members
      const groupWithMembers = getGroupWithMembers(groupId);

      return NextResponse.json({
        group: groupWithMembers,
        message: 'Member removed successfully'
      });
    }

    if (action === 'update_role') {
      // Check if user is an admin
      if (!isGroupAdmin(groupId, userId)) {
        return NextResponse.json(
          { error: 'Only admins can update member roles' },
          { status: 403 }
        );
      }

      if (!user_id || !role) {
        return NextResponse.json(
          { error: 'User ID and role are required' },
          { status: 400 }
        );
      }

      if (role !== 'admin' && role !== 'member') {
        return NextResponse.json(
          { error: 'Role must be either admin or member' },
          { status: 400 }
        );
      }

      // Don't allow changing the last admin to member
      const members = getGroupMembers(groupId);
      const adminCount = members.filter(m => m.role === 'admin').length;
      const memberToUpdate = members.find(m => m.user_id === user_id);

      if (memberToUpdate?.role === 'admin' && role === 'member' && adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot change the last admin to member' },
          { status: 400 }
        );
      }

      // Update the member role
      const updated = updateMemberRole(groupId, user_id, role);

      if (!updated) {
        return NextResponse.json(
          { error: 'Member not found in group' },
          { status: 404 }
        );
      }

      // Get updated group with members
      const groupWithMembers = getGroupWithMembers(groupId);

      return NextResponse.json({
        group: groupWithMembers,
        message: 'Member role updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error performing group action:', error);
    return NextResponse.json(
      { error: 'Failed to perform group action' },
      { status: 500 }
    );
  }
}
