import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, generateId } from '@/lib/auth';
import { createSession } from '@/lib/session';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  sessionToken?: string;
}

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json<RegisterResponse>(
        {
          success: false,
          message: 'Email, password, and name are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<RegisterResponse>(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json<RegisterResponse>(
        {
          success: false,
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email.toLowerCase());

    if (existingUser) {
      return NextResponse.json<RegisterResponse>(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, provider, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'email', 0, ?, ?)
    `);

    stmt.run(userId, email.toLowerCase(), hashedPassword, name, now, now);

    // Create session
    const session = createSession(userId);

    // Get created user
    const user = db
      .prepare('SELECT id, email, name FROM users WHERE id = ?')
      .get(userId) as { id: string; email: string; name: string };

    // Set session token as HTTP-only cookie
    const response = NextResponse.json<RegisterResponse>(
      {
        success: true,
        message: 'User registered successfully',
        user,
        sessionToken: session.sessionToken,
      },
      { status: 201 }
    );

    response.cookies.set('session-token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expires,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<RegisterResponse>(
      {
        success: false,
        message: 'An error occurred during registration',
      },
      { status: 500 }
    );
  }
}
