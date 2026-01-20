import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, getUserBySession } from '@/lib/session';

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (sessionToken) {
      // Delete session from database
      deleteSession(sessionToken);
    }

    // Clear session cookie
    const response = NextResponse.json<LogoutResponse>(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    response.cookies.delete('session-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Still clear the cookie even if there's an error
    const response = NextResponse.json<LogoutResponse>(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    response.cookies.delete('session-token');

    return response;
  }
}
