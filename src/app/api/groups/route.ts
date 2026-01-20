import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GroupsDatabase } from '@/lib/db/groups';
import { getDb } from '@/lib/db';

// GET /api/groups - Get all groups for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);
    const groups = groupsDb.getGroupsByUserId(session.user.id);

    // Enrich groups with member counts and additional info
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const stats = groupsDb.getGroupStats(group.id);
        const members = groupsDb.getGroupMembers(group.id);
        const currentUserMember = members.find((m) => m.user_id === session.user.id);

        return {
          ...group,
          memberCount: stats.memberCount,
          pendingInvitations: stats.pendingInvitations,
          currentUserRole: currentUserMember?.role || 'member',
        };
      })
    );

    return NextResponse.json({ groups: enrichedGroups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Group name must be less than 100 characters' }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description must be less than 500 characters' }, { status: 400 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    const group = groupsDb.createGroup({
      name: name.trim(),
      description: description?.trim() || undefined,
      created_by: session.user.id,
    });

    // Get the enriched group data
    const stats = groupsDb.getGroupStats(group.id);
    const enrichedGroup = {
      ...group,
      memberCount: stats.memberCount,
      pendingInvitations: stats.pendingInvitations,
      currentUserRole: 'admin',
    };

    return NextResponse.json({ group: enrichedGroup }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
