import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Helper function to get the current session on the server side
 * Use this in Server Components and Route Handlers
 *
 * @returns The session object or null if not authenticated
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

/**
 * Helper function to get the current user on the server side
 * Returns null if user is not authenticated
 *
 * @returns The user object or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Helper function to check if user is authenticated
 * Use this to protect server-side code
 *
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await getCurrentSession();
  return !!session;
}
