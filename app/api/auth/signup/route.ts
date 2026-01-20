import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email as string);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = db
      .prepare(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) RETURNING id, email, name'
      )
      .get(email, passwordHash, name) as { id: number; email: string; name: string };

    // Generate token
    const token = await generateToken({
      userId: result.id,
      email: result.email,
    });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
