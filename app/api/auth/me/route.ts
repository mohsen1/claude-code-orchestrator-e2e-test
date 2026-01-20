import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user details from database
    const userDetails = db
      .prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
      .get(user.userId) as { id: number; email: string; name: string; created_at: string } | undefined;

    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name,
        createdAt: userDetails.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
