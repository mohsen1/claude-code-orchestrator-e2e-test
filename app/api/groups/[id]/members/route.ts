import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getGroupWithMembers,
  addGroupMember,
  isGroupMember,
  getGroupMembers
} from '@/lib/db-groups';
import { verifyJWT } from '@/lib/auth';
import db from '@/lib/db-groups';

// Helper function to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyJWT(token);
  return payload ? { userId: payload.userId } : null;
}

// POST /api/groups/[id]/members - Add a member to a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const groupData = getGroupWithMembers(groupId);
    if (!groupData) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if requesting user is a member
    if (!isGroupMember(groupId, user.userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Not a member of this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    let targetUserId = userId;

    // If email is provided, look up user ID
    if (email && !userId) {
      const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
      const userRow = stmt.get(email) as { id: number } | undefined;

      if (!userRow) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      targetUserId = userRow.id;
    }

    if (typeof targetUserId !== 'number') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const currentMembers = getGroupMembers(groupId);
    if (currentMembers.includes(targetUserId)) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      );
    }

    // Add the member
    const success = addGroupMember(groupId, targetUserId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add member to group' },
        { status: 500 }
      );
    }

    // Get updated members list
    const updatedMembers = getGroupMembers(groupId);

    // Fetch user details for response
    const memberStmt = db.prepare('SELECT id, email, name FROM users WHERE id = ?');
    const member = memberStmt.get(targetUserId) as { id: number; email: string; name: string } | undefined;

    return NextResponse.json({
      message: 'Member added successfully',
      member,
      members: updatedMembers
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[id]/members - Get all members of a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const groupData = getGroupWithMembers(groupId);
    if (!groupData) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is a member
    if (!isGroupMember(groupId, user.userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Not a member of this group' },
        { status: 403 }
      );
    }

    const memberIds = getGroupMembers(groupId);

    // Fetch user details for all members
    const placeholders = memberIds.map(() => '?').join(',');
    const stmt = db.prepare(
      `SELECT id, email, name FROM users WHERE id IN (${placeholders})`
    );
    const members = stmt.all(...memberIds) as Array<{ id: number; email: string; name: string }>;

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
