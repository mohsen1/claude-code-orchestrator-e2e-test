import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

/**
 * Type for authenticated request with user information
 */
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    provider: string;
  };
}

/**
 * Middleware helper to authenticate API routes
 * Use this to protect API routes
 *
 * @example
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const user = await authenticateApiRoute(req);
 *   // user is guaranteed to be authenticated here
 *   return NextResponse.json({ data: "protected data" });
 * }
 * ```
 */
export async function authenticateApiRoute(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  return session.user;
}

/**
 * Helper to check if request is authenticated
 * Returns null if not authenticated instead of throwing
 */
export async function getOptionalUser(req: NextRequest) {
  const session = await auth();
  return session?.user || null;
}

/**
 * Create an authenticated API response
 * Wraps API handlers with authentication check
 */
export function withAuth<T extends any[]>(
  handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof authenticateApiRoute>>>, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const user = await authenticateApiRoute(req);

    // If authenticateApiRoute returned a response (error), return it
    if (user instanceof NextResponse) {
      return user;
    }

    // Otherwise, call the handler with the authenticated user
    return handler(req, user, ...args);
  };
}

/**
 * Check if user has permission to access a resource
 * @param userId - The ID of the user making the request
 * @param resourceOwnerId - The ID of the user who owns the resource
 */
export function checkPermission(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}

/**
 * Return 403 Forbidden response
 */
export function forbiddenResponse(message: string = "You don't have permission to access this resource") {
  return NextResponse.json(
    { error: "Forbidden", message },
    { status: 403 }
  );
}

/**
 * Return 401 Unauthorized response
 */
export function unauthorizedResponse(message: string = "You must be logged in to access this resource") {
  return NextResponse.json(
    { error: "Unauthorized", message },
    { status: 401 }
  );
}

/**
 * Return 404 Not Found response
 */
export function notFoundResponse(message: string = "Resource not found") {
  return NextResponse.json(
    { error: "Not Found", message },
    { status: 404 }
  );
}

/**
 * Return success response with data
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Return error response
 */
export function errorResponse(message: string, status: number = 500, error?: string) {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
    },
    { status }
  );
}
