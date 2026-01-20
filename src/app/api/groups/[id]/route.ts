import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GroupsDatabase } from '@/lib/db/groups';
import { getDb } from '@/lib/db';

// GET /api/groups/[id] - Get a specific group
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is a member
    const isMember = groupsDb.isUserMemberOfGroup(groupId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const group = groupsDb.getGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get enriched group data
    const stats = groupsDb.getGroupStats(groupId);
    const members = groupsDb.getGroupMembers(groupId);
    const currentUserMember = members.find((m) => m.user_id === session.user.id);

    const enrichedGroup = {
      ...group,
      memberCount: stats.memberCount,
      pendingInvitations: stats.pendingInvitations,
      currentUserRole: currentUserMember?.role || 'member',
    };

    return NextResponse.json({ group: enrichedGroup });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[id] - Update a group
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    const body = await req.json();
    const { name, description } = body;

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is an admin
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update group details' },
        { status: 403 }
      );
    }

    // Validation
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Group name cannot be empty' }, { status: 400 });
      }
      if (name.length > 100) {
        return NextResponse.json({ error: 'Group name must be less than 100 characters' }, { status: 400 });
      }
    }

    if (description !== undefined && description.length > 500) {
      return NextResponse.json({ error: 'Description must be less than 500 characters' }, { status: 400 });
    }

    const updateData: { name?: string; description?: string } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    const updatedGroup = groupsDb.updateGroup(groupId, updateData);
    if (!updatedGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get enriched group data
    const stats = groupsDb.getGroupStats(groupId);
    const members = groupsDb.getGroupMembers(groupId);
    const currentUserMember = members.find((m) => m.user_id === session.user.id);

    const enrichedGroup = {
      ...updatedGroup,
      memberCount: stats.memberCount,
      pendingInvitations: stats.pendingInvitations,
      currentUserRole: currentUserMember?.role || 'member',
    };

    return NextResponse.json({ group: enrichedGroup });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete a group
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is an admin
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can delete groups' },
        { status: 403 }
      );
    }

    const deleted = groupsDb.deleteGroup(groupId);
    if (!deleted) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
