import type { BaseEntity } from './index';

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

/**
 * Supported OAuth providers
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft';

/**
 * User account from database
 */
export interface User extends BaseEntity {
  email: string;
  name: string;
  image: string | null;
  emailVerified: Date | null;
}

/**
 * User account with soft delete support
 */
export interface UserWithSoftDelete extends BaseEntity {
  deletedAt: Date | null;
  email: string;
  name: string;
  image: string | null;
  emailVerified: Date | null;
}

/**
 * Account linked to a user (OAuth or credential)
 */
export interface Account extends BaseEntity {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

/**
 * User session
 */
export interface Session extends BaseEntity {
  sessionToken: string;
  userId: string;
  expires: Date;
}

/**
 * Verification token for email verification
 */
export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

/**
 * Authentication strategy configuration
 */
export interface AuthConfig {
  /**
   * OAuth providers enabled
   */
  providers: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    github?: {
      clientId: string;
      clientSecret: string;
    };
    microsoft?: {
      clientId: string;
      clientSecret: string;
    };
  };
  /**
   * Session configuration
   */
  session: {
    strategy: 'jwt' | 'database';
    maxAge: number;
    updateAge: number;
  };
  /**
   * Secret key for encryption
   */
  secret: string;
  /**
   * Base URL for the application
   */
  baseUrl: string;
}

/**
 * NextAuth session structure
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
  expires: string;
}

/**
 * JWT token payload
 */
export interface JWTToken {
  userId: string;
  email: string;
  name: string;
  picture: string | null;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Login input credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  redirectTo?: string;
}

/**
 * Registration input data
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  inviteToken?: string;
}

/**
 * Password update request
 */
export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  email: string;
}

/**
 * Email verification confirmation
 */
export interface EmailVerificationConfirm {
  token: string;
}

/**
 * User profile update data
 */
export interface UpdateUserProfileInput {
  name?: string;
  image?: string | null;
  email?: string;
}

/**
 * Public user profile (safe to expose to other users)
 */
export interface PublicUserProfile {
  id: string;
  name: string;
  image: string | null;
}

/**
 * Full user profile (for the authenticated user)
 */
export interface UserProfile extends PublicUserProfile {
  email: string;
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * User activity log entry
 */
export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

/**
 * Authentication activity types
 */
export type AuthActivityType =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'password_reset'
  | 'email_verification'
  | 'oauth_linked'
  | 'oauth_unlinked';

/**
 * Activity log entry
 */
export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: AuthActivityType;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum requests per window
   */
  maxRequests: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Skip successful requests
   */
  skipSuccessfulRequests?: boolean;
}

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  OAUTH_ERROR = 'OAUTH_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
}

/**
 * Password strength requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength?: number;
}

/**
 * Default password requirements
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
};

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  requirements: PasswordRequirements;
  meetsRequirements: boolean;
}
