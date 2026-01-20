import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { GroupMembersDB } from '@/lib/db/group-members';
import { InviteCodesDB } from '@/lib/db/invite-codes';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await context.params;
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const groupsDb = new (await import('@/lib/db/groups')).GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);
    const inviteCodesDb = new InviteCodesDB(db);

    const group = groupsDb.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Validate invite code
    if (!inviteCodesDb.isValid(code)) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Check if invite code belongs to this group
    const invite = inviteCodesDb.findByCode(code);
    if (invite?.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Invalid invite code for this group' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = groupMembersDb.findByGroupAndUser(groupId, session.user.id);
    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this group' },
        { status: 400 }
      );
    }

    // Add user to group
    const member = groupMembersDb.addMember({
      groupId,
      userId: session.user.id,
      role: 'member',
    });

    // Increment use count
    inviteCodesDb.incrementUseCount(code);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        groupId: member.groupId,
        role: member.role,
        joinedAt: member.joinedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: 'Failed to join group' },
      { status: 500 }
    );
  }
}
