import { NextRequest, NextResponse } from 'next/server';
import { groupService } from '@/lib/services/group-service';

/**
 * GET /api/groups
 * Get all groups for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session after implementing NextAuth
    // For now, we'll use a header or query param for testing
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const groups = groupService.getUserGroups(userId);

    return NextResponse.json({
      success: true,
      data: groups,
      count: groups.length
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const body = await request.json();
    const { name, description, currency } = body;

    // Validation
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

    if (currency && !/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json(
        { error: 'Currency must be a valid 3-letter ISO code' },
        { status: 400 }
      );
    }

    // TODO: Get user ID from session after implementing NextAuth
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const group = groupService.createGroup({
      name: name.trim(),
      description: description?.trim(),
      currency: currency || 'USD',
      created_by: userId
    });

    return NextResponse.json({
      success: true,
      data: group
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/groups
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}
