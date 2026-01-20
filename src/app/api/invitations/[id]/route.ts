import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GroupsDatabase } from '@/lib/db/groups';
import { getDb } from '@/lib/db';

// GET /api/invitations/[id] - Get invitation details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitationId = params.id;
    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    const invitation = groupsDb.getInvitationById(invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if the invitation is for the current user
    const userStmt = db.prepare('SELECT email FROM users WHERE id = ?');
    const user = userStmt.get(session.user.id) as { email: string } | undefined;

    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation is not for your account' },
        { status: 403 }
      );
    }

    // Check if invitation has expired
    if (Date.now() > invitation.expires_at) {
      groupsDb.updateInvitation(invitationId, { status: 'expired' });
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    // Get group details
    const group = groupsDb.getGroupById(invitation.group_id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        group_id: invitation.group_id,
        group_name: group.name,
        group_description: group.description,
        invited_by: invitation.invited_by,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[id]/accept - Accept an invitation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitationId = params.id;
    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    const invitation = groupsDb.getInvitationById(invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify the invitation is for the current user
    const userStmt = db.prepare('SELECT email FROM users WHERE id = ?');
    const user = userStmt.get(session.user.id) as { email: string } | undefined;

    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation is not for your account' },
        { status: 403 }
      );
    }

    // Check if invitation has expired
    if (Date.now() > invitation.expires_at) {
      groupsDb.updateInvitation(invitationId, { status: 'expired' });
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    // Check if already a member
    const existingMember = groupsDb.getGroupMember(invitation.group_id, session.user.id);
    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 409 }
      );
    }

    // Accept the invitation
    const member = groupsDb.acceptInvitation(invitationId, session.user.id);
    if (!member) {
      return NextResponse.json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      );
    }

    // Get group details
    const group = groupsDb.getGroupById(invitation.group_id);

    return NextResponse.json({
      message: 'Successfully joined the group',
      member,
      group,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[id] - Decline an invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitationId = params.id;
    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    const invitation = groupsDb.getInvitationById(invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify the invitation is for the current user
    const userStmt = db.prepare('SELECT email FROM users WHERE id = ?');
    const user = userStmt.get(session.user.id) as { email: string } | undefined;

    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation is not for your account' },
        { status: 403 }
      );
    }

    // Decline the invitation
    const declined = groupsDb.declineInvitation(invitationId);
    if (!declined) {
      return NextResponse.json(
        { error: 'Failed to decline invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Invitation declined successfully' });
  } catch (error) {
    console.error('Error declining invitation:', error)  ;
    return NextResponse.json(
      { error: 'Failed to decline invitation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
