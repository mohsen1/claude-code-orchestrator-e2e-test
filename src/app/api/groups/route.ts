import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import db from '@/lib/db';
import { CreateGroupInput, GroupWithMembers } from '@/lib/schema';
import { randomUUID } from 'crypto';

// GET /api/groups - List all groups for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all groups where the user is a member
    const groups = db
      .prepare(`
        SELECT g.*,
          COUNT(gm.user_id) as member_count
        FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
        GROUP BY g.id
        ORDER BY g.created_at DESC
      `)
      .all(session.user.id) as GroupWithMembers[];

    // Get members for each group
    for (const group of groups) {
      const members = db
        .prepare(`
          SELECT u.id, u.name, u.email, u.image
          FROM users u
          INNER JOIN group_members gm ON u.id = gm.user_id
          WHERE gm.group_id = ?
          ORDER BY u.name
        `)
        .all(group.id);

      group.members = members as any;
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateGroupInput = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const groupId = randomUUID();
    const memberId = randomUUID();

    // Create group
    db.prepare(
      'INSERT INTO groups (id, name, description, created_by) VALUES (?, ?, ?, ?)'
    ).run(groupId, name.trim(), description?.trim() || null, session.user.id);

    // Add creator as a member
    db.prepare(
      'INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)'
    ).run(memberId, groupId, session.user.id);

    // Fetch the created group
    const group = db
      .prepare('SELECT * FROM groups WHERE id = ?')
      .get(groupId) as any;

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
