import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Database } from 'better-sqlite3';

// Database initialization
function getDb(): Database.Database {
  const sqlite = require('better-sqlite3');
  return new sqlite('expenses.db');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const inviteCode = params.memberId; // memberId is actually the invite code in this context
    const userEmail = session.user.email;

    const db = getDb();

    // Start a transaction for atomic operations
    const transaction = db.transaction(() => {
      // Find and validate the invite
      const invite = db.prepare(`
        SELECT
          id,
          group_id,
          email,
          invite_code,
          invited_by,
          created_at,
          expires_at
        FROM group_invites
        WHERE group_id = ? AND invite_code = ?
      `).get(groupId, inviteCode);

      if (!invite) {
        throw new Error('INVITE_NOT_FOUND');
      }

      // Verify the email matches
      if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
        throw new Error('EMAIL_MISMATCH');
      }

      // Check if already a member
      const existingMember = db.prepare(`
        SELECT * FROM group_members
        WHERE group_id = ? AND user_email = ?
      `).get(groupId, userEmail);

      if (existingMember) {
        throw new Error('ALREADY_MEMBER');
      }

      // Check expiration (7 days)
      const createdAt = new Date(invite.created_at);
      const expiresAt = new Date(createdAt);
      expiresAt.setDate(expiresAt.getDate() + 7);

      if (invite.expires_at) {
        const dbExpiresAt = new Date(invite.expires_at);
        if (new Date() > dbExpiresAt) {
          throw new Error('INVITE_EXPIRED');
        }
      } else if (new Date() > expiresAt) {
        throw new Error('INVITE_EXPIRED');
      }

      // Add user to the group
      const joinResult = db.prepare(`
        INSERT INTO group_members (group_id, user_email, role, joined_at, balance)
        VALUES (?, ?, 'member', datetime('now'), 0.0)
      `).run(groupId, userEmail);

      if (!joinResult.changes) {
        throw new Error('FAILED_TO_JOIN');
      }

      // Delete the used invite
      db.prepare(`
        DELETE FROM group_invites
        WHERE id = ?
      `).run(invite.id);

      // Get group info
      const group = db.prepare(`
        SELECT name, created_by
        FROM groups
        WHERE id = ?
      `).get(groupId);

      return {
        success: true,
        groupId,
        groupName: group?.name,
        userId: joinResult.lastInsertRowid,
        role: 'member'
      };
    });

    let result;
    try {
      result = transaction();
    } catch (error: any) {
      db.close();

      if (error.message === 'INVITE_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Invalid invitation code' },
          { status: 404 }
        );
      }
      if (error.message === 'EMAIL_MISMATCH') {
        return NextResponse.json(
          { error: 'This invitation was sent to a different email address' },
          { status: 403 }
        );
      }
      if (error.message === 'ALREADY_MEMBER') {
        return NextResponse.json(
          {
            error: 'You are already a member of this group',
            alreadyMember: true
          },
          { status: 400 }
        );
      }
      if (error.message === 'INVITE_EXPIRED') {
        return NextResponse.json(
          { error: 'This invitation has expired' },
          { status: 410 }
        );
      }
      if (error.message === 'FAILED_TO_JOIN') {
        return NextResponse.json(
          { error: 'Failed to join group' },
          { status: 500 }
        );
      }

      throw error;
    }

    db.close();

    // Emit socket event for real-time update (if socket.io is set up)
    // TODO: Emit 'member:joined' event to group room
    // io.to(`group:${groupId}`).emit('member:joined', {
    //   groupId,
    //   userEmail,
    //   timestamp: new Date().toISOString()
    // });

    return NextResponse.json({
      ...result,
      message: 'Successfully joined the group'
    });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

// GET endpoint to check acceptance status (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const inviteCode = params.memberId;
    const db = getDb();

    // Check if the invite is still valid
    const invite = db.prepare(`
      SELECT
        gi.*,
        g.name as group_name
      FROM group_invites gi
      JOIN groups g ON g.id = gi.group_id
      WHERE gi.group_id = ? AND gi.invite_code = ?
    `).get(groupId, inviteCode);

    // Check if already a member
    const isMember = !!db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, session.user.email);

    db.close();

    if (isMember) {
      return NextResponse.json({
        status: 'accepted',
        message: 'You are already a member of this group'
      });
    }

    if (!invite) {
      return NextResponse.json({
        status: 'not_found',
        message: 'Invitation not found or already accepted'
      });
    }

    // Check expiration
    const createdAt = new Date(invite.created_at);
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 7);

    const isExpired = invite.expires_at
      ? new Date() > new Date(invite.expires_at)
      : new Date() > expiresAt;

    if (isExpired) {
      return NextResponse.json({
        status: 'expired',
        message: 'This invitation has expired'
      });
    }

    return NextResponse.json({
      status: 'pending',
      groupName: invite.group_name,
      inviterEmail: invite.invited_by,
      inviteeEmail: invite.email,
      message: 'Invitation is ready to be accepted'
    });

  } catch (error) {
    console.error('Error checking invite status:', error);
    return NextResponse.json(
      { error: 'Failed to check invitation status' },
      { status: 500 }
    );
  }
}
