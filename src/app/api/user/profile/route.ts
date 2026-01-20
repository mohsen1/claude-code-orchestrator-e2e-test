import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/session'
import { db } from '@/lib/db'

/**
 * GET /api/user/profile
 * Fetch current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId()

    // Fetch user from database
    const user = await db.getUser(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user profile (excluding sensitive data)
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId()

    const body = await request.json()
    const { name, email, avatar } = body

    // Validate input
    if (!name && !email && !avatar) {
      return NextResponse.json(
        { error: 'At least one field (name, email, avatar) must be provided' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.getUserByEmail(email)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updates: {
      name?: string
      email?: string
      avatar?: string
      updatedAt: string
    } = {
      updatedAt: new Date().toISOString(),
    }

    if (name) updates.name = name.trim()
    if (email) updates.email = email.trim().toLowerCase()
    if (avatar !== undefined) updates.avatar = avatar

    // Update user in database
    const updatedUser = await db.updateUser(userId, updates)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Return updated profile
    const profile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * PATCH /api/user/profile
 * Partial update of user profile (alias for PUT)
 */
export async function PATCH(request: NextRequest) {
  return PUT(request)
}
