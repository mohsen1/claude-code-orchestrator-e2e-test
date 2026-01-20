import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { GroupsDB } from '@/lib/db/groups';
import { GroupMembersDB } from '@/lib/db/group-members';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const groupsDb = new GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);

    const group = groupsDb.findById(id);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is a member
    const isMember = groupMembersDb.isMember(id, session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    const members = groupMembersDb.findByGroupId(id);
    const currentUserRole = groupMembersDb.findByGroupAndUser(id, session.user.id)?.role || 'member';

    return NextResponse.json({
      group: {
        ...group,
        members,
        currentUserRole,
      },
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, currency } = body;

    const groupsDb = new GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);

    const group = groupsDb.findById(id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is admin
    const isAdmin = groupMembersDb.isAdmin(id, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update group settings' },
        { status: 403 }
      );
    }

    // Validate name
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Group name is required' },
          { status: 400 }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Group name is too long (max 100 characters)' },
          { status: 400 }
        );
      }
    }

    const updatedGroup = groupsDb.update(id, {
      name: name?.trim(),
      description: description?.trim() || undefined,
      currency: currency || undefined,
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const groupsDb = new GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);

    const group = groupsDb.findById(id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Only the creator can delete the group
    if (group.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the group creator can delete the group' },
        { status: 403 }
      );
    }

    groupsDb.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
