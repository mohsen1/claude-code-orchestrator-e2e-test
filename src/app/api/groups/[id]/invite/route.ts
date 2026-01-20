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
    const { expiresIn, maxUses } = body;

    const groupsDb = new (await import('@/lib/db/groups')).GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);
    const inviteCodesDb = new InviteCodesDB(db);

    const group = groupsDb.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is admin
    const isAdmin = groupMembersDb.isAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can generate invite codes' },
        { status: 403 }
      );
    }

    // Generate invite code
    const invite = inviteCodesDb.generateCode(groupId, session.user.id, {
      expiresIn: expiresIn || 168, // Default 7 days (168 hours)
      maxUses: maxUses || null,
    });

    // Create invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/groups/${groupId}/join?code=${invite.code}`;

    return NextResponse.json({
      invite: {
        id: invite.id,
        code: invite.code,
        inviteUrl,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating invite code:', error);
    return NextResponse.json(
      { error: 'Failed to generate invite code' },
      { status: 500 }
    );
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await context.params;
    const groupsDb = new (await import('@/lib/db/groups')).GroupsDB(db);
    const groupMembersDb = new GroupMembersDB(db);
    const inviteCodesDb = new InviteCodesDB(db);

    const group = groupsDb.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is admin
    const isAdmin = groupMembersDb.isAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can view invite codes' },
        { status: 403 }
      );
    }

    const invites = inviteCodesDb.findByGroupId(groupId);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return NextResponse.json({
      invites: invites.map(invite => ({
        id: invite.id,
        code: invite.code,
        inviteUrl: `${baseUrl}/groups/${groupId}/join?code=${invite.code}`,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        createdAt: invite.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite codes' },
      { status: 500 }
    );
  }
}
