import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { GroupMembersDB } from '@/lib/db/group-members';

type RouteContext = {
  params: Promise<{ id: string; memberId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId, memberId } = await context.params;
    const body = await request.json();
    const { role } = body;

    if (role !== 'admin' && role !== 'member') {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or member' },
        { status: 400 }
      );
    }

    const groupsDb = new (await import('@/lib/db/groups')).GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);

    const group = groupsDb.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if current user is admin
    const isCurrentUserAdmin = groupMembersDb.isAdmin(groupId, session.user.id);
    if (!isCurrentUserAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update member roles' },
        { status: 403 }
      );
    }

    // Get the member to update
    const memberToUpdate = groupMembersDb.findByGroupAndUser(groupId, memberId);
    if (!memberToUpdate) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent removing the last admin
    if (role === 'member' && memberToUpdate.role === 'admin') {
      const adminCount = groupMembersDb.findByGroupId(groupId).filter(
        m => m.role === 'admin'
      ).length;

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin. Promote another member first.' },
          { status: 400 }
        );
      }
    }

    // Update member role
    const updatedMember = groupMembersDb.updateRole(groupId, memberId, role);

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
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

    const { id: groupId, memberId } = await context.params;
    const groupsDb = new (await import('@/lib/db/groups')).GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);

    const group = groupsDb.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if current user is admin or is removing themselves
    const isCurrentUserAdmin = groupMembersDb.isAdmin(groupId, session.user.id);
    const isSelf = session.user.id === memberId;

    if (!isCurrentUserAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Only admins can remove members' },
        { status: 403 }
      );
    }

    // Prevent removing the last admin
    if (isCurrentUserAdmin && !isSelf) {
      const memberToRemove = groupMembersDb.findByGroupAndUser(groupId, memberId);
      if (memberToRemove?.role === 'admin') {
        const adminCount = groupMembersDb.findByGroupId(groupId).filter(
          m => m.role === 'admin'
        ).length;

        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot remove the last admin. Promote another member first.' },
            { status: 400 }
          );
        }
      }
    }

    // Remove member
    const success = groupMembersDb.removeMember(groupId, memberId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
