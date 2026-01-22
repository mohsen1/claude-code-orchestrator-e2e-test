import { z } from 'zod'

/**
 * Authentication domain types for SplitSync application
 * Defines the structure and validation schemas for authentication entities
 */

/**
 * Available authentication providers
 */
export enum AuthProvider {
  /** Google OAuth 2.0 */
  GOOGLE = 'google',
  /** Email/password credentials */
  CREDENTIALS = 'credentials',
}

/**
 * User profile from OAuth provider
 */
export interface OAuthProfile {
  /** Provider type */
  provider: AuthProvider
  /** Unique ID from the provider */
  providerAccountId: string
  /** User's email */
  email: string
  /** User's name */
  name: string
  /** Profile picture URL */
  picture?: string
  /** Email verification status */
  emailVerified: boolean
}

/**
 * User profile from credentials authentication
 */
export interface CredentialsProfile {
  /** Provider type (always credentials) */
  provider: AuthProvider.CREDENTIALS
  /** User's email */
  email: string
  /** User's name */
  name: string
  /** Email verification status */
  emailVerified: boolean
  /** Password hash (bcrypt) */
  passwordHash: string
}

/**
 * Authentication user session
 */
export interface AuthUser {
  /** User's unique ID */
  id: string
  /** User's email */
  email: string
  /** User's name */
  name: string
  /** Profile avatar URL */
  image?: string | null
  /** Email verification status */
  emailVerified: Date | null
}

/**
 * Authentication session
 */
export interface AuthSession {
  /** Session token */
  sessionToken: string
  /** User ID */
  userId: string
  /** Session expiration time */
  expires: Date
}

/**
 * Login credentials input
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Registration input
 */
export interface RegisterInput {
  email: string
  password: string
  name: string
  inviteToken?: string
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string
}

/**
 * Password reset input
 */
export interface PasswordResetInput {
  token: string
  password: string
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  email: string
}

/**
 * Email verification input
 */
export interface EmailVerificationInput {
  token: string
}

// Zod validation schemas for runtime validation

/**
 * Schema for validating login credentials
 */
export const loginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

/**
 * Schema for validating registration input
 */
export const registerInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  inviteToken: z.string().optional(),
})

/**
 * Schema for validating password reset request
 */
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * Schema for validating password reset input
 */
export const passwordResetInputSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

/**
 * Schema for validating email verification request
 */
export const emailVerificationRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * Schema for validating email verification input
 */
export const emailVerificationInputSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

/**
 * Schema for validating password strength
 */
export const passwordStrengthSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

/**
 * Schema for validating OAuth profile data
 */
export const oAuthProfileSchema = z.object({
  provider: z.nativeEnum(AuthProvider),
  providerAccountId: z.string(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  picture: z.string().url().optional(),
  emailVerified: z.boolean(),
})

// Type inference from schemas
export type LoginCredentialsSchema = z.infer<typeof loginCredentialsSchema>
export type RegisterInputSchema = z.infer<typeof registerInputSchema>
export type PasswordResetRequestSchema = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInputSchema = z.infer<typeof passwordResetInputSchema>
export type EmailVerificationRequestSchema = z.infer<typeof emailVerificationRequestSchema>
export type EmailVerificationInputSchema = z.infer<typeof emailVerificationInputSchema>

// Helper functions for authentication-related operations

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 */
export function isStrongPassword(password: string): boolean {
  return passwordStrengthSchema.safeParse(password).success
}

/**
 * Checks password strength and returns score
 */
export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
  isStrong: boolean
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else feedback.push('Password should be at least 8 characters')

  if (password.length >= 12) score++

  if (/[A-Z]/.test(password)) score++
  else feedback.push('Password should contain at least one uppercase letter')

  if (/[a-z]/.test(password)) score++
  else feedback.push('Password should contain at least one lowercase letter')

  if (/[0-9]/.test(password)) score++
  else feedback.push('Password should contain at least one number')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else feedback.push('Password should contain at least one special character')

  const isStrong = score >= 4

  return {
    score,
    feedback,
    isStrong,
  }
}

/**
 * Sanitizes user input for authentication
 */
export function sanitizeAuthInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

/**
 * Normalizes email address
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''

  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}

/**
 * Generates a password reset token with expiration
 */
export function generatePasswordResetToken(): {
  token: string
  expiresAt: Date
} {
  const token = generateSecureToken(64)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

  return { token, expiresAt }
}

/**
 * Generates an email verification token with expiration
 */
export function generateEmailVerificationToken(): {
  token: string
  expiresAt: Date
} {
  const token = generateSecureToken(64)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

  return { token, expiresAt }
}

/**
 * Checks if a token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Calculates session expiration date
 */
export function calculateSessionExpiration(rememberMe: boolean = false): Date {
  const expiresAt = new Date()
  const days = rememberMe ? 30 : 7
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}

/**
 * Checks if a session is valid
 */
export function isSessionValid(session: AuthSession): boolean {
  return session.expires > new Date()
}

/**
 * Formats user display name
 */
export function formatUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest'
  return user.name || user.email.split('@')[0]
}

/**
 * Gets user initials
 */
export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Checks if user email is verified
 */
export function isEmailVerified(emailVerified: Date | null): boolean {
  return emailVerified !== null
}

/**
 * Calculates token time remaining
 */
export function getTokenTimeRemaining(expiresAt: Date): {
  hours: number
  minutes: number
  isExpired: boolean
} {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  const isExpired = diffMs <= 0

  if (isExpired) {
    return { hours: 0, minutes: 0, isExpired: true }
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return { hours, minutes, isExpired: false }
}

/**
 * Masks email for privacy in logs
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) {
    return `*@${domain}`
  }
  const maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
  return `${maskedLocal}@${domain}`
}

/**
 * Validates session token format
 */
export function isValidSessionToken(token: string): boolean {
  // Session tokens should be at least 32 characters
  return token.length >= 32 && /^[A-Za-z0-9_-]+$/.test(token)
}

/**
 * Formats last login time for display
 */
export function formatLastLogin(lastLogin: Date | null): string {
  if (!lastLogin) return 'Never'

  const now = new Date()
  const diffMs = now.getTime() - lastLogin.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

  return lastLogin.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: lastLogin.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Checks if password reset is allowed (rate limiting)
 */
export const passwordResetRateLimiter = {
  // Track attempts per email
  attempts: new Map<string, { count: number; lastAttempt: Date }>(),

  canAttempt(email: string, maxAttempts: number = 3, windowMs: number = 3600000): boolean {
    const record = this.attempts.get(email)
    const now = new Date()

    if (!record) {
      this.attempts.set(email, { count: 1, lastAttempt: now })
      return true
    }

    const timeSinceLastAttempt = now.getTime() - record.lastAttempt.getTime()

    // Reset if window has passed
    if (timeSinceLastAttempt > windowMs) {
      this.attempts.set(email, { count: 1, lastAttempt: now })
      return true
    }

    // Check if under limit
    if (record.count >= maxAttempts) {
      return false
    }

    record.count++
    record.lastAttempt = now
    return true
  },

  reset(email: string): void {
    this.attempts.delete(email)
  },
}

/**
 * Rate limiter for login attempts
 */
export const loginRateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>(),

  canAttempt(email: string, maxAttempts: number = 5, windowMs: number = 900000): {
    allowed: boolean
    remainingAttempts: number
    lockedUntil?: Date
  } {
    const record = this.attempts.get(email)
    const now = new Date()

    if (!record) {
      this.attempts.set(email, { count: 1, lastAttempt: now })
      return { allowed: true, remainingAttempts: maxAttempts - 1 }
    }

    // Check if account is locked
    if (record.lockedUntil && now < record.lockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: record.lockedUntil,
      }
    }

    const timeSinceLastAttempt = now.getTime() - record.lastAttempt.getTime()

    // Reset if window has passed
    if (timeSinceLastAttempt > windowMs || (record.lockedUntil && now >= record.lockedUntil)) {
      this.attempts.set(email, { count: 1, lastAttempt: now })
      return { allowed: true, remainingAttempts: maxAttempts - 1 }
    }

    // Check if under limit
    if (record.count >= maxAttempts) {
      // Lock account for 30 minutes
      record.lockedUntil = new Date(now.getTime() + 1800000)
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: record.lockedUntil,
      }
    }

    record.count++
    record.lastAttempt = now
    return {
      allowed: true,
      remainingAttempts: maxAttempts - record.count,
    }
  },

  reset(email: string): void {
    this.attempts.delete(email)
  },

  recordSuccessfulLogin(email: string): void {
    this.attempts.delete(email)
  },
}
