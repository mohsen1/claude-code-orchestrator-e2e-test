import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { createSession, getUserBySession } from '@/lib/session';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
  sessionToken?: string;
}

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = db
      .prepare(`
        SELECT id, email, password, name, image, email_verified
        FROM users
        WHERE email = ? AND provider = 'email'
      `)
      .get(email.toLowerCase()) as any;

    if (!user) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Create session
    const session = createSession(user.id);

    // Prepare user response (without password)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };

    const response = NextResponse.json<LoginResponse>(
      {
        success: true,
        message: 'Login successful',
        user: userResponse,
        sessionToken: session.sessionToken,
      },
      { status: 200 }
    );

    // Set session token as HTTP-only cookie
    response.cookies.set('session-token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expires,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    const user = getUserBySession(sessionToken);

    if (!user) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Invalid or expired session',
        },
        { status: 401 }
      );
    }

    return NextResponse.json<LoginResponse>(
      {
        success: true,
        message: 'User authenticated',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: 'An error occurred',
      },
      { status: 500 }
    );
  }
}
