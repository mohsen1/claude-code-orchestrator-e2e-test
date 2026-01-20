import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  isGroupMember,
  createInvitation,
  getInvitationsByGroupId,
  deleteInvitation,
  acceptInvitation,
  getPendingInvitationsByEmail
} from '@/lib/db/groups';
import { getUserByEmail } from '@/lib/db/users';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = params.id;

    // Check if user is a member
    if (!isGroupMember(groupId, payload.userId)) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: 'User with this email does not exist' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isAlreadyMember = await isGroupMember(groupId, user.id);
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = createInvitation({
      group_id: groupId,
      email: email.toLowerCase(),
      invited_by: payload.userId
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = params.id;

    // Check if user is a member
    if (!isGroupMember(groupId, payload.userId)) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    // Get pending invitations for this group
    const invitations = getInvitationsByGroupId(groupId);

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const groupId = params.id;

    // Check if user is a member
    if (!isGroupMember(groupId, payload.userId)) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { invitationId } = body;

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Delete invitation
    const success = deleteInvitation(invitationId, payload.userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Invitation not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Invitation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    );
  }
}
