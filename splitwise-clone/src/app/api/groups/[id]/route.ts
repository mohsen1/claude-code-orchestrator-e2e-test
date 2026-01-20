import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  getGroupDetail,
  updateGroup,
  deleteGroup,
  isGroupMember,
  isGroupOwner,
  removeMemberFromGroup
} from '@/lib/db/groups';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = params.id;

    // Check if user is a member
    if (!isGroupMember(groupId, payload.userId)) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    const group = getGroupDetail(groupId);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ group }, { status: 200 });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = params.id;

    // Check if user is the owner
    if (!isGroupOwner(groupId, payload.userId)) {
      return NextResponse.json(
        { error: 'Only group owner can update the group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Group name is required' },
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

    // Update group
    const group = updateGroup(groupId, {
      name: name?.trim(),
      description: description?.trim()
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ group }, { status: 200 });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = params.id;

    // Delete group (only owner can delete)
    const success = deleteGroup(groupId, payload.userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Group not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Group deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
