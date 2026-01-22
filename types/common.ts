import { z } from 'zod'

/**
 * Common type definitions used across the SplitSync application
 * These types provide consistency and reusability across different domains
 */

/**
 * Unique identifier type (UUID v4)
 */
export type ID = string

/**
 * Timestamps interface for entities with creation and update times
 */
export interface Timestamps {
  /** When the entity was created */
  createdAt: Date
  /** When the entity was last updated */
  updatedAt: Date
}

/**
 * Money value stored as integer cents
 * All monetary values use this type to avoid floating-point precision issues
 */
export type Money = number

/**
 * Currency code type (ISO 4217)
 */
export type Currency = string

/**
 * Supported ISO 4217 currency codes
 */
export enum ISO4217Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  CHF = 'CHF',
  CNY = 'CNY',
  INR = 'INR',
  MXN = 'MXN',
  BRL = 'BRL',
  KRW = 'KRW',
  SGD = 'SGD',
  HKD = 'HKD',
  NOK = 'NOK',
  SEK = 'SEK',
  NZD = 'NZD',
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  /** Number of items to return per page */
  limit: number
  /** Number of items to skip (for pagination) */
  offset: number
  /** Field to sort by */
  sortBy?: string
  /** Sort order */
  sortOrder?: SortOrder
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Data items for the current page */
  items: T[]
  /** Total number of items across all pages */
  total: number
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Total number of pages */
  totalPages: number
  /** Whether there is a next page */
  hasNextPage: boolean
  /** Whether there is a previous page */
  hasPreviousPage: boolean
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T
  /** Response message (optional) */
  message?: string
  /** Response metadata */
  meta?: {
    /** Request ID for tracing */
    requestId?: string
    /** Response timestamp */
    timestamp: Date
    /** Additional metadata */
    [key: string]: any
  }
}

/**
 * Standard API error response
 */
export interface ApiError {
  /** Error code */
  code: string
  /** Human-readable error message */
  message: string
  /** Additional error details */
  details?: Record<string, any>
  /** Stack trace (development only) */
  stack?: string
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string
  /** Error message */
  message: string
  /** Invalid value that was provided */
  receivedValue?: any
}

/**
 * Sort order enum
 */
export enum SortOrder {
  /** Ascending order */
  ASC = 'asc',
  /** Descending order */
  DESC = 'desc',
}

/**
 * Date range filter
 */
export interface DateRange {
  /** Start of range (inclusive) */
  startDate: Date
  /** End of range (inclusive) */
  endDate: Date
}

/**
 * Email type (validated string)
 */
export type Email = string

/**
 * URL type (validated string)
 */
export type URL = string

/**
 * UUID type (validated string)
 */
export type UUID = string

// Zod validation schemas for runtime validation

/**
 * Schema for validating UUID
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/**
 * Schema for validating ID (UUID)
 */
export const idSchema = uuidSchema

/**
 * Schema for validating email
 */
export const emailSchema = z.string().email('Invalid email address')

/**
 * Schema for validating URL
 */
export const urlSchema = z.string().url('Invalid URL')

/**
 * Schema for validating money (positive integer)
 */
export const moneySchema = z
  .number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  })
  .int('Amount must be an integer (cents)')
  .nonnegative('Amount must be non-negative')

/**
 * Schema for validating positive money
 */
export const positiveMoneySchema = moneySchema.positive('Amount must be positive')

/**
 * Schema for validating currency code (ISO 4217)
 */
export const currencySchema = z
  .string()
  .length(3, 'Currency code must be 3 characters (ISO 4217)')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase ISO 4217 format')

/**
 * Schema for validating pagination parameters
 */
export const paginationParamsSchema = z.object({
  limit: z
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  offset: z
    .number()
    .int('Offset must be an integer')
    .nonnegative('Offset must be non-negative')
    .default(0),
  sortBy: z.string().optional(),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
})

/**
 * Schema for validating date range
 */
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: 'Start date must be before end date' }
)

/**
 * Schema for validating API error
 */
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  stack: z.string().optional(),
})

/**
 * Schema for validating validation error
 */
export const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  receivedValue: z.any().optional(),
})

// Type inference from schemas
export type UUIDSchema = z.infer<typeof uuidSchema>
export type EmailSchema = z.infer<typeof emailSchema>
export type URLSchema = z.infer<typeof urlSchema>
export type MoneySchema = z.infer<typeof moneySchema>
export type CurrencySchema = z.infer<typeof currencySchema>
export type PaginationParamsSchema = z.infer<typeof paginationParamsSchema>
export type DateRangeSchema = z.infer<typeof dateRangeSchema>
export type ApiErrorSchema = z.infer<typeof apiErrorSchema>

// Helper functions for common operations

/**
 * Checks if a string is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success
}

/**
 * Checks if a string is a valid email
 */
export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success
}

/**
 * Checks if a string is a valid URL
 */
export function isValidURL(value: string): boolean {
  return urlSchema.safeParse(value).success
}

/**
 * Checks if a number is valid money (integer cents)
 */
export function isValidMoney(value: number): boolean {
  return moneySchema.safeParse(value).success
}

/**
 * Formats money for display
 */
export function formatMoney(amount: Money, currency: Currency): string {
  const amountInUnits = amount / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  })
  return formatter.format(amountInUnits)
}

/**
 * Formats money compactly (e.g., $1.2K instead of $1,200)
 */
export function formatMoneyCompact(amount: Money, currency: Currency): string {
  const amountInUnits = amount / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
  })
  return formatter.format(amountInUnits)
}

/**
 * Calculates paginated response metadata
 */
export function calculatePaginationMetadata(
  total: number,
  page: number,
  pageSize: number
): Pick<PaginatedResponse<any>, 'totalPages' | 'hasNextPage' | 'hasPreviousPage'> {
  const totalPages = Math.ceil(total / pageSize)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return {
    totalPages,
    hasNextPage,
    hasPreviousPage,
  }
}

/**
 * Creates a paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const metadata = calculatePaginationMetadata(total, page, pageSize)

  return {
    items,
    total,
    page,
    pageSize,
    ...metadata,
  }
}

/**
 * Calculates offset from page number
 */
export function pageToOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

/**
 * Calculates page number from offset
 */
export function offsetToPage(offset: number, pageSize: number): number {
  return Math.floor(offset / pageSize) + 1
}

/**
 * Generates a UUID v4
 */
export function generateUUID(): UUID {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Gets currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  })
  const formatted = formatter.format(0)
  return formatted.replace(/[\d.,]/g, '').trim()
}

/**
 * Checks if a date range is valid
 */
export function isValidDateRange(range: DateRange): boolean {
  return dateRangeSchema.safeParse(range).success
}

/**
 * Checks if a date is within a range
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.startDate && date <= range.endDate
}

/**
 * Formats a date for API responses (ISO 8601)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString()
}

/**
 * Parses a date from API request
 */
export function parseDateFromAPI(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Creates a standard API response
 */
export function createApiResponse<T>(
  data: T,
  message?: string,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return {
    data,
    message,
    meta: {
      timestamp: new Date(),
      ...meta,
    },
  }
}

/**
 * Creates a standard API error
 */
export function createApiError(
  code: string,
  message: string,
  details?: Record<string, any>,
  stack?: string
): ApiError {
  return {
    code,
    message,
    details,
    stack,
  }
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Generates a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Validates that required fields are present
 */
export function validateRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: (keyof T)[] } {
  const missing = requiredFields.filter((field) => !obj[field])
  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Checks if two values are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Creates a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Creates a throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Formats a file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Converts a file size to bytes
 */
export function fileSizeToBytes(size: number, unit: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  }

  return size * (units[unit.toUpperCase()] || 1)
}

/**
 * Truncates text to a maximum length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Converts a string to title case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
}

/**
 * Generates a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Formats a percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculates percentage change between two values
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Checks if a value is within a range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Chooses a random element from an array
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffles an array in place
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Removes duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Groups array elements by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Sorts an array of objects by a key
 */
export function sortBy<T>(array: T[], key: keyof T, order: SortOrder = SortOrder.ASC): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return order === SortOrder.ASC ? -1 : 1
    if (aVal > bVal) return order === SortOrder.ASC ? 1 : -1
    return 0
  })
}
