import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/api-helpers';
import db from '@/lib/db';

/**
 * GET /api/user
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = requireAuth(request);

    // Get full user profile from database
    const userProfile = db
      .prepare(`
        SELECT id, email, name, image, email_verified as emailVerified,
               provider, created_at as createdAt, updated_at as updatedAt
        FROM users
        WHERE id = ?
      `)
      .get(user.id) as any;

    if (!userProfile) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse({
      message: 'User profile retrieved successfully',
      user: userProfile,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createErrorResponse('Authentication required', 401);
    }
    console.error('Get user error:', error);
    return createErrorResponse('An error occurred while fetching user profile', 500);
  }
}

/**
 * PATCH /api/user
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { name, image } = body;

    // Validate input
    if (!name && !image) {
      return createErrorResponse('At least one field (name or image) is required', 400);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image);
    }

    updates.push('updated_at = datetime("now")');
    values.push(user.id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // Get updated user
    const updatedUser = db
      .prepare(`
        SELECT id, email, name, image, email_verified as emailVerified,
               provider, created_at as createdAt, updated_at as updatedAt
        FROM users
        WHERE id = ?
      `)
      .get(user.id) as any;

    return createSuccessResponse({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createErrorResponse('Authentication required', 401);
    }
    console.error('Update user error:', error);
    return createErrorResponse('An error occurred while updating profile', 500);
  }
}
