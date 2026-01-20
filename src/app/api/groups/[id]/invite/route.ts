import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { Database } from 'better-sqlite3';

// Database initialization (in production, use a singleton pattern)
function getDb(): Database.Database {
  const sqlite = require('better-sqlite3');
  return new sqlite('expenses.db');
}

// Generate a unique invite code
function generateInviteCode(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send invite email (placeholder - integrate with your email service)
async function sendInviteEmail(email: string, inviteCode: string, groupName: string, groupId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/groups/${groupId}/invite/${inviteCode}`;

  console.log('📧 Invite Email:', {
    to: email,
    subject: `You're invited to join "${groupName}"`,
    inviteUrl,
    message: `Click here to join: ${inviteUrl}`
  });

  // TODO: Integrate with Resend, SendGrid, or similar service
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'invites@expense-app.com',
  //   to: email,
  //   subject: `You're invited to join "${groupName}"`,
  //   html: `<p>Click <a href="${inviteUrl}">here</a> to join the group.</p>`
  // });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify user is a member of the group
    const memberCheck = db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, session.user.email);

    if (!memberCheck) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Check if email is already a member
    const existingMember = db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, email);

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite for this email
    const existingInvite = db.prepare(`
      SELECT * FROM group_invites
      WHERE group_id = ? AND email = ?
    `).get(groupId, email);

    let inviteCode: string;

    if (existingInvite) {
      // Reuse existing invite code
      inviteCode = existingInvite.invite_code;

      // Update created_at timestamp
      db.prepare(`
        UPDATE group_invites
        SET created_at = datetime('now')
        WHERE id = ?
      `).run(existingInvite.id);
    } else {
      // Generate new invite code
      inviteCode = generateInviteCode();

      // Create invite record
      db.prepare(`
        INSERT INTO group_invites (group_id, email, invite_code, invited_by, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(groupId, email, inviteCode, session.user.email);
    }

    // Get group name for email
    const group = db.prepare('SELECT name FROM groups WHERE id = ?').get(groupId);

    // Send invite email
    await sendInviteEmail(email, inviteCode, group?.name || 'a group', groupId);

    db.close();

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      inviteCode,
      // In development, return the invite URL for easy testing
      inviteUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/groups/${groupId}/invite/${inviteCode}`
    });

  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

// Get all pending invites for a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const db = getDb();

    // Verify user is a member of the group
    const memberCheck = db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, session.user.email);

    if (!memberCheck) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Get all pending invites
    const invites = db.prepare(`
      SELECT
        id,
        email,
        invite_code,
        invited_by,
        created_at,
        expires_at
      FROM group_invites
      WHERE group_id = ?
      ORDER BY created_at DESC
    `).all(groupId);

    db.close();

    return NextResponse.json({ invites });

  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
