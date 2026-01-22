import { z } from 'zod'

/**
 * User domain types for SplitSync application
 * Defines the structure and validation schemas for user entities
 */

/**
 * User entity representing an application user
 * All monetary values are stored as integers (cents) to avoid floating-point precision issues
 */
export interface User {
  /** Unique identifier (UUID v4) */
  id: string
  /** User's email address - used for authentication */
  email: string
  /** User's display name */
  name: string
  /** Profile avatar URL (optional) */
  avatar?: string | null
  /** User's preferred locale for internationalization */
  locale: string
  /** User's preferred currency code (ISO 4217) */
  currencyCode: string
  /** User's timezone for date/time display */
  timezone: string
  /** Authentication provider used (google, credentials) */
  provider: 'google' | 'credentials' | null
  /** Provider-specific user ID */
  providerAccountId?: string | null
  /** Email verification status */
  emailVerified: Date | null
  /** Account creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
  /** Account deletion timestamp (null if active) */
  deletedAt: Date | null
}

/**
 * Input schema for creating a new user
 */
export interface UserCreateInput {
  email: string
  name: string
  password?: string
  provider?: 'google' | 'credentials'
  providerAccountId?: string
  avatar?: string
  locale?: string
  currencyCode?: string
  timezone?: string
}

/**
 * Input schema for updating an existing user
 */
export interface UserUpdateInput {
  name?: string
  avatar?: string
  locale?: string
  currencyCode?: string
  timezone?: string
  email?: string
}

/**
 * Public user profile (safe to expose to other users)
 */
export interface UserProfile {
  id: string
  name: string
  avatar?: string | null
  currencyCode: string
}

/**
 * User settings stored in database
 */
export interface UserSettings {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  weeklySummary: boolean
  settlementReminders: boolean
  newExpenseAlerts: boolean
  theme: 'light' | 'dark' | 'system'
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  currencyDisplay: 'symbol' | 'code' | 'both'
}

/**
 * User statistics for dashboard and reporting
 */
export interface UserStats {
  userId: string
  totalGroups: number
  activeGroups: number
  totalExpenses: number
  totalExpensesAmount: number // in cents
  totalOwed: number // in cents (positive means others owe user)
  totalOwing: number // in cents (positive means user owes others)
  totalSettled: number // in cents
  pendingSettlements: number
  netBalance: number // in cents (positive means net positive)
  averageExpenseAmount: number // in cents
  largestExpense: number // in cents
  mostActiveGroup: {
    groupId: string
    groupName: string
    expenseCount: number
  } | null
  joinDate: Date
  lastActivity: Date
}

// Zod validation schemas for runtime validation

/**
 * Schema for validating user creation input
 */
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  provider: z.enum(['google', 'credentials']).optional(),
  providerAccountId: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  locale: z.string().default('en-US'),
  currencyCode: z.string().length(3).default('USD'),
  timezone: z.string().default('UTC'),
})

/**
 * Schema for validating user update input
 */
export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  locale: z.string().optional(),
  currencyCode: z.string().length(3).optional(),
  timezone: z.string().optional(),
  email: z.string().email().optional(),
})

/**
 * Schema for validating user settings
 */
export const userSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  weeklySummary: z.boolean().default(true),
  settlementReminders: z.boolean().default(true),
  newExpenseAlerts: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  currencyDisplay: z.enum(['symbol', 'code', 'both']).default('symbol'),
})

/**
 * Schema for validating email input
 */
export const emailSchema = z.string().email('Invalid email address')

/**
 * Schema for validating password input
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Schema for validating name input
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

/**
 * Schema for validating currency code
 */
export const currencyCodeSchema = z.string().length(3).regex(/^[A-Z]{3}$/)

/**
 * Schema for validating locale
 */
export const localeSchema = z.string().regex(/^[a-z]{2}-[A-Z]{2}$/)

/**
 * Schema for validating timezone
 */
export const timezoneSchema = z.string()

// Type inference from schemas
export type UserCreateInputSchema = z.infer<typeof userCreateSchema>
export type UserUpdateInputSchema = z.infer<typeof userUpdateSchema>
export type UserSettingsSchema = z.infer<typeof userSettingsSchema>

// Helper functions for user-related operations

/**
 * Validates a user email
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

/**
 * Validates a user password
 */
export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

/**
 * Validates a user name
 */
export function isValidName(name: string): boolean {
  return nameSchema.safeParse(name).success
}

/**
 * Formats a monetary value in cents to a display string
 */
export function formatMoney(
  amountInCents: number,
  currencyCode: string,
  display: 'symbol' | 'code' | 'both' = 'symbol'
): string {
  const amount = amountInCents / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: display,
  })
  return formatter.format(amount)
}

/**
 * Gets a user's initials from their name
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
 * Generates a default avatar URL based on user's name
 */
export function generateDefaultAvatar(name: string): string {
  const initials = getUserInitials(name)
  // This would typically use an avatar service or generate an SVG
  return `/api/avatar?initials=${encodeURIComponent(initials)}`
}

/**
 * Calculates if a user account is active
 */
export function isUserActive(user: User): boolean {
  return user.deletedAt === null
}

/**
 * Determines if a user is new (joined within last 7 days)
 */
export function isNewUser(user: User): boolean {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return user.createdAt > sevenDaysAgo
}
