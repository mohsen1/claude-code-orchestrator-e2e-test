import { NextRequest } from 'next/server';
import { getUserBySession } from '@/lib/session';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
}

/**
 * Get the authenticated user from the request
 * This should be called in API routes after middleware has validated the session
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  const sessionToken = request.cookies.get('session-token')?.value;

  if (!sessionToken) {
    return null;
  }

  return getUserBySession(sessionToken);
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(request: NextRequest): AuthenticatedUser {
  const user = getAuthenticatedUser(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
