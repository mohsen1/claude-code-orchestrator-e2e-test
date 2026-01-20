import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { GroupsDB } from '@/lib/db/groups';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupsDb = new GroupsDB(db);
    const groups = groupsDb.findByUserId(session.user.id);

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, currency } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Group name is too long (max 100 characters)' },
        { status: 400 }
      );
    }

    const groupsDb = new GroupsDB(db);
    const groupMembersDb = new (await import('@/lib/db/group-members')).GroupMembersDB(db);

    // Create the group
    const group = groupsDb.create({
      name: name.trim(),
      description: description?.trim() || null,
      createdBy: session.user.id,
      currency: currency || 'USD',
    });

    // Add creator as admin
    groupMembersDb.addMember({
      groupId: group.id,
      userId: session.user.id,
      role: 'admin',
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
