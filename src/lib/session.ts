import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Get the current session on the server side
 * Use this in server components, API routes, and server actions
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Get the current user ID from the session
 * Returns null if not authenticated
 */
export async function getCurrentUserId() {
  const session = await getSession()
  return session?.user?.id || null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session && !!session.user
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in server actions where authentication is required
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session || !session.user) {
    throw new Error('Unauthorized: Authentication required')
  }

  return session
}

/**
 * Require authentication with user ID
 * Returns user ID or throws error
 */
export async function requireUserId(): Promise<string> {
  const session = await getSession()

  if (!session || !session.user?.id) {
    throw new Error('Unauthorized: Authentication required')
  }

  return session.user.id
}

/**
 * Extract user ID from request headers
 * This is used in API routes where middleware adds user info to headers
 */
export function getUserIdFromHeaders(request: NextRequest): string | null {
  const userId = request.headers.get('x-user-id')
  return userId || null
}

/**
 * Extract user email from request headers
 */
export function getUserEmailFromHeaders(request: NextRequest): string | null {
  const email = request.headers.get('x-user-email')
  return email || null
}

/**
 * Validate session on the server side
 * Returns session data if valid, null otherwise
 */
export async function validateSession() {
  try {
    const session = await getSession()
    if (!session) {
      return null
    }

    // Check if session has expired
    if (session.expires && new Date(session.expires) < new Date()) {
      return null
    }

    return session
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

/**
 * Create a session token for API routes
 * This can be used to create temporary tokens for specific operations
 */
export async function createSessionToken(userId: string, expiresIn: string = '1h') {
  // This would typically use JWT signing
  // For now, return a placeholder implementation
  const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64')
  return {
    token,
    expiresIn,
  }
}

/**
 * Verify a session token
 */
export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, timestamp] = decoded.split(':')

    // Check if token is not too old (1 hour)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 60 * 60 * 1000) {
      return null
    }

    return userId
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Helper to get user from both session and headers
 * Useful for API routes that support both server components and client requests
 */
export async function getUserFromRequest(request: NextRequest) {
  // Try to get from headers first (set by middleware)
  const userIdFromHeader = getUserIdFromHeaders(request)
  const emailFromHeader = getUserEmailFromHeaders(request)

  if (userIdFromHeader && emailFromHeader) {
    return {
      id: userIdFromHeader,
      email: emailFromHeader,
    }
  }

  // Fall back to session
  const session = await getSession()
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email,
    }
  }

  return null
}

/**
 * Type for session user
 */
export type SessionUser = {
  id: string
  email: string
  name?: string
  image?: string
}

/**
 * Type for session data
 */
export type SessionData = {
  user: SessionUser
  expires: string
}
