import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Database } from 'better-sqlite3';

// Database initialization
function getDb(): Database.Database {
  const sqlite = require('better-sqlite3');
  return new sqlite('expenses.db');
}

interface InviteValidationResult {
  valid: boolean;
  groupId?: string;
  groupName?: string;
  inviterEmail?: string;
  inviteeEmail?: string;
  alreadyMember?: boolean;
  expired?: boolean;
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; code: string } }
) {
  try {
    const session = await getServerSession();
    const groupId = params.id;
    const inviteCode = params.code;

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          valid: false,
          message: 'You must be logged in to accept an invitation'
        } as InviteValidationResult,
        { status: 401 }
      );
    }

    const db = getDb();

    // Find the invite
    const invite = db.prepare(`
      SELECT
        gi.id,
        gi.group_id,
        gi.email as invitee_email,
        gi.invite_code,
        gi.invited_by,
        gi.created_at,
        gi.expires_at,
        g.name as group_name
      FROM group_invites gi
      JOIN groups g ON g.id = gi.group_id
      WHERE gi.group_id = ? AND gi.invite_code = ?
    `).get(groupId, inviteCode);

    if (!invite) {
      db.close();
      return NextResponse.json(
        {
          valid: false,
          message: 'Invalid invitation code'
        } as InviteValidationResult,
        { status: 404 }
      );
    }

    // Check if invite has expired (7 days validity)
    const createdAt = new Date(invite.created_at);
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 7);

    if (invite.expires_at) {
      const dbExpiresAt = new Date(invite.expires_at);
      if (new Date() > dbExpiresAt) {
        db.close();
        return NextResponse.json(
          {
            valid: false,
            expired: true,
            message: 'This invitation has expired'
          } as InviteValidationResult,
          { status: 410 }
        );
      }
    } else if (new Date() > expiresAt) {
      db.close();
      return NextResponse.json(
        {
          valid: false,
          expired: true,
          message: 'This invitation has expired'
        } as InviteValidationResult,
        { status: 410 }
      );
    }

    // Check if the logged-in user's email matches the invite email
    // OR if the invite was sent to an email that the user can verify
    const userEmail = session.user.email.toLowerCase().trim();
    const inviteeEmail = invite.invitee_email.toLowerCase().trim();

    if (userEmail !== inviteeEmail) {
      db.close();
      return NextResponse.json(
        {
          valid: false,
          message: `This invitation was sent to ${invite.invitee_email}, not ${userEmail}. Please log in with the correct account.`
        } as InviteValidationResult,
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, userEmail);

    if (existingMember) {
      db.close();
      return NextResponse.json(
        {
          valid: true,
          alreadyMember: true,
          groupId,
          groupName: invite.group_name,
          inviterEmail: invite.invited_by,
          inviteeEmail: invite.invitee_email,
          message: 'You are already a member of this group'
        } as InviteValidationResult
      );
    }

    db.close();

    // Invite is valid
    return NextResponse.json({
      valid: true,
      groupId,
      groupName: invite.group_name,
      inviterEmail: invite.invited_by,
      inviteeEmail: invite.invitee_email,
      message: 'Invitation valid. You can join this group.'
    } as InviteValidationResult);

  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      {
        valid: false,
        message: 'Failed to validate invitation'
      } as InviteValidationResult,
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to revoke an invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; code: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const inviteCode = params.code;
    const db = getDb();

    // Verify user is a member of the group
    const memberCheck = db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, session.user.email);

    if (!memberCheck) {
      db.close();
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Delete the invite
    const result = db.prepare(`
      DELETE FROM group_invites
      WHERE group_id = ? AND invite_code = ?
    `).run(groupId, inviteCode);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking invite:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invitation' },
      { status: 500 }
    );
  }
}
