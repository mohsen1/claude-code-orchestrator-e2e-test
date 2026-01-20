import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GroupsDatabase } from '@/lib/db/groups';
import { getDb } from '@/lib/db';

// GET /api/groups/[id]/members/invite - Get all pending invitations for a group
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

    const invitations = groupsDb.getInvitationsByGroupId(groupId);

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[id]/members/invite - Invite a member to the group
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
    const { email, expiresInHours = 48 } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (expiresInHours < 1 || expiresInHours > 168) { // Max 1 week
      return NextResponse.json(
        { error: 'Expiration time must be between 1 and 168 hours' },
        { status: 400 }
      );
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is an admin
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can invite members' },
        { status: 403 }
      );
    }

    // Check if the group exists
    const group = groupsDb.getGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if the user is already a member
    // Note: This would require a users table lookup by email
    // For now, we'll just create the invitation

    // Create the invitation
    const invitation = groupsDb.createInvitation(
      groupId,
      email,
      session.user.id,
      expiresInHours
    );

    // In a real implementation, you would send an email here
    // For now, we'll return the invitation details

    return NextResponse.json(
      {
        invitation,
        message: 'Invitation created successfully',
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitation.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id]/members/invite - Cancel/Delete an invitation
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
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is an admin
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can cancel invitations' },
        { status: 403 }
      );
    }

    // Get the invitation to verify it belongs to this group
    const invitation = groupsDb.getInvitationById(invitationId);
    if (!invitation || invitation.group_id !== groupId) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Update the invitation status to declined (effectively canceling it)
    groupsDb.updateInvitation(invitationId, { status: 'declined' });

    return NextResponse.json({ message: 'Invitation canceled successfully' });
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invitation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[id]/members/invite - Resend an invitation
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
    const { invitationId, expiresInHours = 48 } = body;

    if (!invitationId || typeof invitationId !== 'string') {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Check if user is an admin
    const isAdmin = groupsDb.isUserGroupAdmin(groupId, session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can resend invitations' },
        { status: 403 }
      );
    }

    // Get the invitation
    const invitation = groupsDb.getInvitationById(invitationId);
    if (!invitation || invitation.group_id !== groupId) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Update the expiration time
    const newExpiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
    const updatedInvitation = groupsDb.updateInvitation(invitationId, { expires_at: newExpiresAt });

    if (!updatedInvitation) {
      return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
    }

    // In a real implementation, you would resend the email here

    return NextResponse.json({
      invitation: updatedInvitation,
      message: 'Invitation resent successfully',
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitation.id}`,
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
