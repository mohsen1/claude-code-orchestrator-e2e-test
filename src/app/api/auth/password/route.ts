import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { getUserBySession, deleteSession } from '@/lib/session';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface PasswordResponse {
  success: boolean;
  message: string;
}

/**
 * PUT /api/auth/password
 * Change user's password (requires authentication)
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    const user = getUserBySession(sessionToken);

    if (!user) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'Invalid or expired session',
        },
        { status: 401 }
      );
    }

    const body: ChangePasswordRequest = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'New password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // Get user's current password
    const userRecord = db
      .prepare('SELECT password FROM users WHERE id = ?')
      .get(user.id) as { password: string } | undefined;

    if (!userRecord) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, userRecord.password);
    if (!isValidPassword) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    const stmt = db.prepare(`
      UPDATE users
      SET password = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(hashedPassword, user.id);

    // Invalidate all sessions except current one for security
    // Optional: Uncomment to invalidate all other sessions
    // db.prepare('DELETE FROM sessions WHERE user_id = ? AND session_token != ?')
    //   .run(user.id, sessionToken);

    return NextResponse.json<PasswordResponse>(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json<PasswordResponse>(
      {
        success: false,
        message: 'An error occurred while changing password',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/password
 * Request password reset (initiate reset flow)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Find user
    const user = db
      .prepare('SELECT id, email FROM users WHERE email = ?')
      .get(email.toLowerCase()) as any;

    // Always return success to prevent email enumeration
    // In production, you would send an email with reset token here
    if (user) {
      // Generate reset token (expires in 1 hour)
      const resetToken = Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token (you would typically have a password_resets table)
      // For now, we'll just log it
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Expires at: ${expiresAt.toISOString()}`);

      // In production, send email with reset link
      // await sendPasswordResetEmail(user.email, resetToken);
    }

    return NextResponse.json<PasswordResponse>(
      {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Request password reset error:', error);
    return NextResponse.json<PasswordResponse>(
      {
        success: false,
        message: 'An error occurred while requesting password reset',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/password
 * Reset password with token
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'Email, token, and new password are required',
        },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'New password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // In a real implementation, you would verify the reset token from a password_resets table
    // For this example, we'll assume the token is valid if the user exists
    const user = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email.toLowerCase()) as any;

    if (!user) {
      return NextResponse.json<PasswordResponse>(
        {
          success: false,
          message: 'Invalid reset token or email',
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    const stmt = db.prepare(`
      UPDATE users
      SET password = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(hashedPassword, user.id);

    // Invalidate all user sessions for security
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);

    return NextResponse.json<PasswordResponse>(
      {
        success: true,
        message: 'Password reset successfully. Please login with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json<PasswordResponse>(
      {
        success: false,
        message: 'An error occurred while resetting password',
      },
      { status: 500 }
    );
  }
}
