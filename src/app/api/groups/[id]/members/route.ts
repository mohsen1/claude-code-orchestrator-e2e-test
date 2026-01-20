import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GroupsDatabase } from '@/lib/db/groups';
import { getDb } from '@/lib/db';

// GET /api/groups/[id]/members - Get all members of a group
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

    const members = groupsDb.getGroupMembers(groupId);

    // Enrich members with user details (assuming you have a users table)
    const enrichedMembers = members.map((member) => ({
      id: member.id,
      group_id: member.group_id,
      user_id: member.user_id,
      role: member.role,
      status: member.status,
      joined_at: member.joined_at,
      updated_at: member.updated_at,
    }));

    return NextResponse.json({ members: enrichedMembers });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[id]/members - Add a member directly (for already registered users)
export async function POST(
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
    const { userId, role = 'member' } = body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'member') {
      return NextResponse.json({ error: 'Role must be either admin or member' }, { status: 400 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is an admin
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can add members directly' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = groupsDb.getGroupMember(groupId, userId);
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      );
    }

    const member = groupsDb.addMember(groupId, userId, role);

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id]/members - Remove a member from the group
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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if the requester is an admin or removing themselves
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    const isRemovingSelf = userId === session.user.id;

    if (!isAdmin && !isRemovingSelf) {
      return NextResponse.json(
        { error: 'Only admins can remove other members' },
        { status: 403 }
      );
    }

    // Prevent the last admin from leaving
    if (isRemovingSelf && isAdmin) {
      const members = groupsDb.getGroupMembers(groupId);
      const adminCount = members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot leave the group as the last admin. Promote another member to admin first.' },
          { status: 400 }
        );
      }
    }

    const removed = groupsDb.removeMember(groupId, userId);
    if (!removed) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[id]/members - Update a member's role
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
    const { memberId, role } = body;

    // Validation
    if (!memberId || typeof memberId !== 'string') {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'member') {
      return NextResponse.json({ error: 'Role must be either admin or member' }, { status: 400 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is an admin
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update member roles' },
        { status: 403 }
      );
    }

    // Get the member to update
    const memberToUpdate = groupsDb.getMemberById(memberId);
    if (!memberToUpdate || memberToUpdate.group_id !== groupId) {
      return NextResponse.json({ error: 'Member not found in this group' }, { status: 404 });
    }

    // Prevent the last admin from being demoted
    if (memberToUpdate.role === 'admin' && role === 'member') {
      const members = groupsDb.getGroupMembers(groupId);
      const adminCount = members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin. Promote another member to admin first.' },
          { status: 400 }
        );
      }
    }

    const updatedMember = groupsDb.updateMemberRole(memberId, role);
    if (!updatedMember) {
      return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
    }

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
