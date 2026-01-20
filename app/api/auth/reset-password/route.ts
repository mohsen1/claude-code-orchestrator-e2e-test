import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import {
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
  formatZodError,
} from '@/lib/auth/validation';
import { db } from '@/lib/db';

// POST /api/auth/reset-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = resetPasswordRequestSchema.parse(body);

    // Find user
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        {
          message:
            'If an account with this email exists, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return NextResponse.json(
        {
          message:
            'This account uses OAuth for authentication. Please use your OAuth provider to sign in.',
        },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = addHours(new Date(), 1); // Token expires in 1 hour

    // Hash the token for storage
    const hashedToken = await hash(resetToken, 12);

    // Store reset token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // In production, you would send an email here with the reset link
    // For now, we'll return the token in the response (development only)
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/verify?token=${resetToken}&email=${validatedData.email}`;

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json(
      {
        message:
          'If an account with this email exists, a password reset link has been sent.',
        // Dev only: Include token and URL for testing
        ...(process.env.NODE_ENV === 'development' && {
          devToken: resetToken,
          devUrl: resetUrl,
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      const formattedErrors = formatZodError(error as any);
      return NextResponse.json(
        { error: 'Validation failed', details: formattedErrors },
        { status: 400 }
      );
    }

    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/reset-password - Confirm password reset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = resetPasswordConfirmSchema.parse(body);

    // Find user by email (would be passed from the reset link)
    const email = body.email;
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token exists and is not expired
    if (!user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'No password reset request found' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Verify token
    const isValidToken = await compare(validatedData.token, user.resetToken);

    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(validatedData.password, 12);

    // Update password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      const formattedErrors = formatZodError(error as any);
      return NextResponse.json(
        { error: 'Validation failed', details: formattedErrors },
        { status: 400 }
      );
    }

    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
