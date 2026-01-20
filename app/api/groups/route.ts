import { NextRequest, NextResponse } from 'next/server';
import {
  createGroup,
  getGroupsByUserId,
  getGroupWithMembers,
} from '@/lib/db/groups';

/**
 * GET /api/groups
 * Get all groups for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session when auth is implemented
    // For now, we'll get it from a header or use a default
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const groups = getGroupsByUserId(userId);

    return NextResponse.json({
      groups,
      count: groups.length
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Group name must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Create the group
    const group = createGroup({
      name: name.trim(),
      description: description?.trim() || undefined,
      created_by: userId,
    });

    // Fetch the group with members
    const groupWithMembers = getGroupWithMembers(group.id);

    return NextResponse.json(
      {
        group: groupWithMembers,
        message: 'Group created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
