import { cookies } from "next/headers";
import { auth } from "./auth";

/**
 * Get the current session from the request
 * This works in Server Components and Server Actions
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}

/**
 * Require authentication - throws if not authenticated
 * Use this in Server Actions or Server Components that require auth
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

/**
 * Check if a user is authenticated
 * Returns boolean without throwing
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return !!session?.user;
}

/**
 * Get user ID from session
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Check if current user is the owner of a resource
 * @param resourceOwnerId - The ID of the user who owns the resource
 */
export async function isOwner(resourceOwnerId: string): Promise<boolean> {
  const userId = await getUserId();
  return userId === resourceOwnerId;
}

/**
 * Require ownership - throws if current user is not the owner
 * @param resourceOwnerId - The ID of the user who owns the resource
 */
export async function requireOwner(resourceOwnerId: string) {
  if (!(await isOwner(resourceOwnerId))) {
    throw new Error("You don't have permission to access this resource");
  }
}

/**
 * Get session token for API calls
 * This can be useful when making server-side API calls
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("next-auth.session-token")?.value || null;
}

/**
 * Create a server action wrapper that requires authentication
 * @param action - The server action to protect
 */
export function withAuth<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    await requireAuth();
    return action(...args);
  };
}
