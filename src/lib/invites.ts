import crypto from 'crypto';

/**
 * Generate a cryptographically secure invite code
 * @returns A 64-character hex string
 */
export function generateInviteCode(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiration date for an invite (default: 7 days from now)
 * @param days Number of days until expiration (default: 7)
 * @returns ISO string of expiration date
 */
export function getInviteExpiration(days: number = 7): string {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + days);
  return expiration.toISOString();
}

/**
 * Check if an invite has expired
 * @param createdAt ISO string of when the invite was created
 * @param expiresAt Optional ISO string of custom expiration
 * @returns true if expired, false otherwise
 */
export function isInviteExpired(createdAt: string, expiresAt?: string): boolean {
  const now = new Date();

  if (expiresAt) {
    return now > new Date(expiresAt);
  }

  // Default 7-day expiration
  const created = new Date(createdAt);
  const expiration = new Date(created);
  expiration.setDate(expiration.getDate() + 7);

  return now > expiration;
}

/**
 * Generate invite URL
 * @param groupId Group ID
 * @param inviteCode Invite code
 * @param baseUrl Base URL of the application (default: NEXTAUTH_URL or localhost:3000)
 * @returns Full invite URL
 */
export function getInviteUrl(
  groupId: string,
  inviteCode: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base}/groups/${groupId}/invite/${inviteCode}`;
}

/**
 * Email template for group invitations
 * @param params Invitation parameters
 * @returns Email object with subject and body
 */
export function createInviteEmail(params: {
  groupName: string;
  inviterName: string;
  inviteUrl: string;
}) {
  const { groupName, inviterName, inviteUrl } = params;

  return {
    subject: `You're invited to join "${groupName}"`,
    text: `${inviterName} invited you to join the group "${groupName}" on the expense sharing app.

Click the link below to accept the invitation:
${inviteUrl}

This invitation will expire in 7 days.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You're invited to join "${groupName}"</h2>
        <p style="color: #666; font-size: 16px;">
          ${inviterName} invited you to join the group <strong>"${groupName}"</strong> on the expense sharing app.
        </p>
        <div style="margin: 30px 0;">
          <a href="${inviteUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
          ">
            Accept Invitation
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          This invitation will expire in 7 days.
        </p>
        <p style="color: #999; font-size: 14px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `
  };
}

/**
 * Send invite email using Resend (or other email service)
 * @param to Recipient email
 * @param params Invitation parameters
 */
export async function sendInviteEmail(
  to: string,
  params: {
    groupName: string;
    inviterName: string;
    inviteUrl: string;
  }
): Promise<{ success: boolean; error?: string }> {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Invite Email:', {
      to,
      ...params
    });
    return { success: true };
  }

  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  // Example with Resend:
  //
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  //
  // const emailData = createInviteEmail(params);
  //
  // try {
  //   await resend.emails.send({
  //     from: 'invites@expense-app.com',
  //     to,
  //     subject: emailData.subject,
  //     text: emailData.text,
  //     html: emailData.html
  //   });
  //   return { success: true };
  // } catch (error: any) {
  //   console.error('Failed to send email:', error);
  //   return { success: false, error: error.message };
  // }

  return { success: true };
}

/**
 * Validate email format
 * @param email Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize email address (lowercase and trim)
 * @param email Email address to normalize
 * @returns Normalized email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
