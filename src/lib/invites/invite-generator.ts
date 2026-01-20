import crypto from 'crypto';

/**
 * Generate a unique invite code
 * @returns A 12-character URL-safe base64 string
 */
export function generateInviteCode(): string {
  const bytes = crypto.randomBytes(9); // 9 bytes * 8 bits = 72 bits, base64 encodes to 12 chars
  return bytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate a unique token for invite validation
 * @returns A 32-character hex string
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Validate invite code format
 * @param code - The invite code to validate
 * @returns True if valid format
 */
export function isValidInviteCode(code: string): boolean {
  return /^[A-Za-z0-9_-]{12}$/.test(code);
}
