import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

/**
 * Get the current session server-side
 * Use this in server components and API routes
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user server-side
 * Returns null if user is not authenticated
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in server actions and API routes where auth is required
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

/**
 * Check if user is authenticated
 * Returns boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession()
  return !!session
}

/**
 * Get user ID from session
 * Returns null if user is not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const session = await getCurrentSession()
  return session?.user?.id || null
}

/**
 * Type for session with user ID
 */
export interface AuthSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
}
