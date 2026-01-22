import { z } from 'zod'

/**
 * Expense domain types for SplitSync application
 * Defines the structure and validation schemas for expense entities
 */

/**
 * How an expense is split among group members
 */
export enum ExpenseSplitType {
  /** Split equally among all members */
  EQUAL = 'equal',
  /** Split by specific percentages */
  PERCENTAGE = 'percentage',
  /** Split by exact amounts */
  EXACT = 'exact',
  /** Split based on shares/units */
  SHARES = 'shares',
}

/**
 * Categories for organizing expenses
 */
export enum ExpenseCategory {
  /** Food and dining expenses */
  FOOD = 'food',
  /** Transportation costs */
  TRANSPORTATION = 'transportation',
  /** Accommodation and lodging */
  ACCOMMODATION = 'accommodation',
  /** Entertainment and activities */
  ENTERTAINMENT = 'entertainment',
  /** Shopping and retail purchases */
  SHOPPING = 'shopping',
  /** Utilities and bills */
  UTILITIES = 'utilities',
  /** Healthcare and medical expenses */
  HEALTHCARE = 'healthcare',
  /** Education and learning expenses */
  EDUCATION = 'education',
  /** General/miscellaneous expenses */
  GENERAL = 'general',
  /** Other category */
  OTHER = 'other',
}

/**
 * Expense entity representing a shared expense
 */
export interface Expense {
  /** Unique identifier (UUID v4) */
  id: string
  /** ID of the group this expense belongs to */
  groupId: string
  /** Description of the expense */
  description: string
  /** Detailed notes (optional) */
  notes?: string | null
  /** Total amount in cents */
  amount: number
  /** Currency code (ISO 4217) */
  currencyCode: string
  /** ID of the user who paid */
  paidById: string
  /** Date of the expense */
  date: Date
  /** Category of the expense */
  category: ExpenseCategory
  /** How the expense is split */
  splitType: ExpenseSplitType
  /** Whether this is a recurring expense */
  isRecurring: boolean
  /** Receipt or attachment URL (optional) */
  attachmentUrl?: string | null
  /** Attachment metadata */
  attachmentMetadata?: {
    fileName: string
    fileSize: number
    mimeType: string
  } | null
  /** When the expense was created */
  createdAt: Date
  /** When the expense was last updated */
  updatedAt: Date
  /** ID of the user who created the expense record */
  createdById: string
  /** ID of the user who last updated the expense */
  updatedById: string | null
  /** Whether the expense has been deleted */
  isDeleted: boolean
  /** When the expense was deleted */
  deletedAt: Date | null
}

/**
 * Individual expense split for a group member
 */
export interface ExpenseSplit {
  /** Unique identifier */
  id: string
  /** ID of the expense */
  expenseId: string
  /** ID of the user who owes this portion */
  userId: string
  /** Amount this user owes in cents */
  amount: number
  /** Percentage of total expense (for PERCENTAGE split type) */
  percentage?: number | null
  /** Number of shares (for SHARES split type) */
  shares?: number | null
  /** Whether this split has been settled */
  isSettled: boolean
  /** When this split was settled */
  settledAt?: Date | null
  /** ID of the settlement that cleared this split */
  settlementId?: string | null
}

/**
 * Attachment information for receipts
 */
export interface ExpenseAttachment {
  /** Unique identifier */
  id: string
  /** ID of the expense */
  expenseId: string
  /** Original filename */
  fileName: string
  /** File size in bytes */
  fileSize: number
  /** MIME type */
  mimeType: string
  /** Storage URL */
  url: string
  /** When the attachment was uploaded */
  uploadedAt: Date
  /** ID of the user who uploaded */
  uploadedById: string
}

/**
 * Input schema for creating a new expense
 */
export interface ExpenseCreateInput {
  groupId: string
  description: string
  notes?: string
  amount: number
  currencyCode?: string
  paidById: string
  date?: Date
  category?: ExpenseCategory
  splitType: ExpenseSplitType
  splits: {
    userId: string
    amount?: number
    percentage?: number
    shares?: number
  }[]
  attachmentUrl?: string
  isRecurring?: boolean
}

/**
 * Input schema for updating an existing expense
 */
export interface ExpenseUpdateInput {
  description?: string
  notes?: string
  amount?: number
  paidById?: string
  date?: Date
  category?: ExpenseCategory
  splitType?: ExpenseSplitType
  splits?: {
    userId: string
    amount?: number
    percentage?: number
    shares?: number
  }[]
  attachmentUrl?: string
}

/**
 * Filters for querying expenses
 */
export interface ExpenseFilters {
  groupId?: string
  userId?: string
  paidById?: string
  category?: ExpenseCategory
  minAmount?: number
  maxAmount?: number
  startDate?: Date
  endDate?: Date
  includeDeleted?: boolean
  search?: string
}

/**
 * Statistics for expense reporting
 */
export interface ExpenseStats {
  totalExpenses: number
  totalAmount: number // in cents
  averageAmount: number // in cents
  largestExpense: number // in cents
  smallestExpense: number // in cents
  expensesByCategory: {
    category: ExpenseCategory
    count: number
    amount: number // in cents
    percentage: number
  }[]
  expensesByUser: {
    userId: string
    userName: string
    paidCount: number
    paidAmount: number // in cents
    owedCount: number
    owedAmount: number // in cents
  }[]
  expensesOverTime: {
    date: Date
    count: number
    amount: number // in cents
  }[]
}

// Zod validation schemas for runtime validation

/**
 * Schema for validating expense creation input
 */
export const expenseCreateSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  description: z.string().min(1, 'Description is required').max(500),
  notes: z.string().max(2000).optional(),
  amount: z.number().int().positive('Amount must be positive'),
  currencyCode: z.string().length(3).default('USD'),
  paidById: z.string().uuid('Invalid payer ID'),
  date: z.date().optional().default(() => new Date()),
  category: z.nativeEnum(ExpenseCategory).default(ExpenseCategory.GENERAL),
  splitType: z.nativeEnum(ExpenseSplitType),
  splits: z.array(
    z.object({
      userId: z.string().uuid('Invalid user ID'),
      amount: z.number().int().nonnegative().optional(),
      percentage: z.number().min(0).max(100).optional(),
      shares: z.number().int().positive().optional(),
    })
  ).min(1, 'At least one split is required'),
  attachmentUrl: z.string().url().optional(),
  isRecurring: z.boolean().default(false),
}).refine(
  (data) => {
    // Validate that splits match the split type
    const { splitType, splits } = data
    if (splitType === ExpenseSplitType.EQUAL) {
      return true // Equal split doesn't need explicit split data
    }
    if (splitType === ExpenseSplitType.EXACT) {
      return splits.every((s) => s.amount !== undefined && s.amount >= 0)
    }
    if (splitType === ExpenseSplitType.PERCENTAGE) {
      return splits.every((s) => s.percentage !== undefined && s.percentage > 0)
    }
    if (splitType === ExpenseSplitType.SHARES) {
      return splits.every((s) => s.shares !== undefined && s.shares > 0)
    }
    return false
  },
  {
    message: 'Split data does not match the split type',
    path: ['splits'],
  }
).refine(
  (data) => {
    // Validate that percentages sum to 100 for PERCENTAGE split
    if (data.splitType === ExpenseSplitType.PERCENTAGE) {
      const totalPercentage = data.splits.reduce(
        (sum, s) => sum + (s.percentage ?? 0),
        0
      )
      return Math.abs(totalPercentage - 100) < 0.01 // Allow small floating point errors
    }
    return true
  },
  {
    message: 'Percentages must sum to 100',
    path: ['splits'],
  }
).refine(
  (data) => {
    // Validate that exact amounts sum to total for EXACT split
    if (data.splitType === ExpenseSplitType.EXACT) {
      const totalAmount = data.splits.reduce((sum, s) => sum + (s.amount ?? 0), 0)
      return totalAmount === data.amount
    }
    return true
  },
  {
    message: 'Split amounts must sum to total expense amount',
    path: ['splits'],
  }
)

/**
 * Schema for validating expense update input
 */
export const expenseUpdateSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  notes: z.string().max(2000).optional().nullable(),
  amount: z.number().int().positive().optional(),
  paidById: z.string().uuid().optional(),
  date: z.date().optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  splitType: z.nativeEnum(ExpenseSplitType).optional(),
  splits: z.array(
    z.object({
      userId: z.string().uuid(),
      amount: z.number().int().nonnegative().optional(),
      percentage: z.number().min(0).max(100).optional(),
      shares: z.number().int().positive().optional(),
    })
  ).optional(),
  attachmentUrl: z.string().url().optional().nullable(),
})

/**
 * Schema for validating expense filters
 */
export const expenseFiltersSchema = z.object({
  groupId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  paidById: z.string().uuid().optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  minAmount: z.number().int().nonnegative().optional(),
  maxAmount: z.number().int().positive().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  includeDeleted: z.boolean().default(false),
  search: z.string().optional(),
})

// Type inference from schemas
export type ExpenseCreateInputSchema = z.infer<typeof expenseCreateSchema>
export type ExpenseUpdateInputSchema = z.infer<typeof expenseUpdateSchema>
export type ExpenseFiltersSchema = z.infer<typeof expenseFiltersSchema>

// Helper functions for expense-related operations

/**
 * Validates an expense amount
 */
export function isValidExpenseAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0
}

/**
 * Formats expense amount for display
 */
export function formatExpenseAmount(amount: number, currencyCode: string): string {
  const amountInDollars = amount / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  })
  return formatter.format(amountInDollars)
}

/**
 * Calculates equal split amounts for an expense
 */
export function calculateEqualSplit(amount: number, memberCount: number): number {
  if (memberCount === 0) return 0
  return Math.floor(amount / memberCount)
}

/**
 * Calculates remainder from equal split (to be distributed)
 */
export function calculateEqualSplitRemainder(amount: number, memberCount: number): number {
  return amount - calculateEqualSplit(amount, memberCount) * memberCount
}

/**
 * Validates that split amounts match the total
 */
export function validateSplitTotal(
  splits: { amount?: number; percentage?: number; shares?: number }[],
  totalAmount: number,
  splitType: ExpenseSplitType
): boolean {
  if (splitType === ExpenseSplitType.EQUAL) {
    return true
  }

  if (splitType === ExpenseSplitType.EXACT) {
    const splitTotal = splits.reduce((sum, s) => sum + (s.amount ?? 0), 0)
    return splitTotal === totalAmount
  }

  if (splitType === ExpenseSplitType.PERCENTAGE) {
    const percentageTotal = splits.reduce((sum, s) => sum + (s.percentage ?? 0), 0)
    return Math.abs(percentageTotal - 100) < 0.01
  }

  if (splitType === ExpenseSplitType.SHARES) {
    return splits.every((s) => s.shares !== undefined && s.shares > 0)
  }

  return false
}

/**
 * Calculates split amounts based on shares
 */
export function calculateSharesSplit(
  amount: number,
  splits: { userId: string; shares: number }[]
): { userId: string; amount: number }[] {
  const totalShares = splits.reduce((sum, s) => sum + s.shares, 0)
  if (totalShares === 0) return []

  const result: { userId: string; amount: number }[] = []
  let distributed = 0

  for (let i = 0; i < splits.length; i++) {
    const split = splits[i]
    if (i === splits.length - 1) {
      // Last member gets the remainder to avoid rounding errors
      result.push({ userId: split.userId, amount: amount - distributed })
    } else {
      const amountForSplit = Math.floor((amount * split.shares) / totalShares)
      result.push({ userId: split.userId, amount: amountForSplit })
      distributed += amountForSplit
    }
  }

  return result
}

/**
 * Gets expense category display name
 */
export function getExpenseCategoryDisplayName(category: ExpenseCategory): string {
  const names: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: 'Food & Dining',
    [ExpenseCategory.TRANSPORTATION]: 'Transportation',
    [ExpenseCategory.ACCOMMODATION]: 'Accommodation',
    [ExpenseCategory.ENTERTAINMENT]: 'Entertainment',
    [ExpenseCategory.SHOPPING]: 'Shopping',
    [ExpenseCategory.UTILITIES]: 'Utilities & Bills',
    [ExpenseCategory.HEALTHCARE]: 'Healthcare',
    [ExpenseCategory.EDUCATION]: 'Education',
    [ExpenseCategory.GENERAL]: 'General',
    [ExpenseCategory.OTHER]: 'Other',
  }
  return names[category] || category
}

/**
 * Gets expense category icon (emoji)
 */
export function getExpenseCategoryIcon(category: ExpenseCategory): string {
  const icons: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: '🍽️',
    [ExpenseCategory.TRANSPORTATION]: '🚗',
    [ExpenseCategory.ACCOMMODATION]: '🏠',
    [ExpenseCategory.ENTERTAINMENT]: '🎉',
    [ExpenseCategory.SHOPPING]: '🛍️',
    [ExpenseCategory.UTILITIES]: '💡',
    [ExpenseCategory.HEALTHCARE]: '🏥',
    [ExpenseCategory.EDUCATION]: '📚',
    [ExpenseCategory.GENERAL]: '📝',
    [ExpenseCategory.OTHER]: '📦',
  }
  return icons[category] || '💰'
}

/**
 * Checks if an expense has attachment
 */
export function expenseHasAttachment(expense: Expense): boolean {
  return expense.attachmentUrl !== null && expense.attachmentUrl !== undefined
}

/**
 * Checks if an expense is recent (within last 7 days)
 */
export function isRecentExpense(expense: Expense): boolean {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return expense.date > sevenDaysAgo
}

/**
 * Formats expense date for display
 */
export function formatExpenseDate(date: Date): string {
  const now = new Date()
  const expenseDate = new Date(date)
  const daysDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) return 'Today'
  if (daysDiff === 1) return 'Yesterday'
  if (daysDiff < 7) return `${daysDiff} days ago`

  return expenseDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: expenseDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Validates attachment file
 */
export function validateAttachmentFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only images and PDF files are allowed' }
  }

  return { valid: true }
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
