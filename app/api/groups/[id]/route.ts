import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getGroupWithMembers,
  updateGroup,
  deleteGroup,
  isGroupMember
} from '@/lib/db-groups';
import { verifyJWT } from '@/lib/auth';

// Helper function to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyJWT(token);
  return payload ? { userId: payload.userId } : null;
}

// GET /api/groups/[id] - Get a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const groupData = getGroupWithMembers(groupId);
    if (!groupData) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is a member
    if (!isGroupMember(groupId, user.userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Not a member of this group' },
        { status: 403 }
      );
    }

    return NextResponse.json(groupData);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[id] - Update a group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const groupData = getGroupWithMembers(groupId);
    if (!groupData) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Only the creator can update the group
    if (groupData.group.created_by !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden - Only group creator can update' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const updatedGroup = updateGroup(groupId, name.trim());

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const groupData = getGroupWithMembers(groupId);
    if (!groupData) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Only the creator can delete the group
    if (groupData.group.created_by !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden - Only group creator can delete' },
        { status: 403 }
      );
    }

    const deleted = deleteGroup(groupId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete group' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
