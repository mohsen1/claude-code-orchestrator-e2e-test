import { z } from 'zod'

/**
 * Settlement domain types for SplitSync application
 * Defines the structure and validation schemas for settlement entities
 */

/**
 * Status of a settlement
 */
export enum SettlementStatus {
  /** Settlement has been proposed but not yet confirmed */
  PENDING = 'pending',
  /** Settlement has been confirmed and completed */
  COMPLETED = 'completed',
  /** Settlement has been cancelled */
  CANCELLED = 'cancelled',
}

/**
 * Settlement entity representing a payment between users
 */
export interface Settlement {
  /** Unique identifier (UUID v4) */
  id: string
  /** ID of the group this settlement belongs to */
  groupId: string
  /** ID of the user who owes money */
  fromUserId: string
  /** ID of the user who is owed money */
  toUserId: string
  /** Amount being settled in cents */
  amount: number
  /** Currency code (ISO 4217) */
  currencyCode: string
  /** Current status of the settlement */
  status: SettlementStatus
  /** Notes or description (optional) */
  notes?: string | null
  /** When the settlement was created */
  createdAt: Date
  /** When the settlement was completed */
  completedAt?: Date | null
  /** When the settlement was cancelled */
  cancelledAt?: Date | null
  /** ID of the user who created the settlement */
  createdById: string
  /** ID of the user who completed the settlement */
  completedById: string | null
  /** Associated expense splits this settlement clears */
  expenseSplitIds: string[]
}

/**
 * Debt relationship between two users
 */
export interface Debt {
  /** ID of the user who owes money */
  fromUserId: string
  /** ID of the user who is owed money */
  toUserId: string
  /** Amount owed in cents */
  amount: number
  /** Currency code */
  currencyCode: string
}

/**
 * Complete debt graph for a group
 * Represents all outstanding debts between users
 */
export interface DebtGraph {
  /** ID of the group */
  groupId: string
  /** Currency code for all debts */
  currencyCode: string
  /** All debt relationships in the group */
  debts: Debt[]
  /** When the debt graph was calculated */
  calculatedAt: Date
  /** Total amount of outstanding debt */
  totalDebt: number // in cents
}

/**
 * Optimized settlement plan to minimize number of transactions
 */
export interface SettlementPlan {
  /** ID of the group */
  groupId: string
  /** Currency code for all settlements */
  currencyCode: string
  /** Recommended settlements (optimized) */
  settlements: {
    /** ID of the user who should pay */
    fromUserId: string
    /** ID of the user who should receive payment */
    toUserId: string
    /** Amount to pay in cents */
    amount: number
  }[]
  /** Number of transactions in the plan */
  transactionCount: number
  /** Original number of debts before optimization */
  originalDebtCount: number
  /** When the plan was calculated */
  calculatedAt: Date
}

/**
 * Input schema for creating a new settlement
 */
export interface SettlementCreateInput {
  groupId: string
  fromUserId: string
  toUserId: string
  amount: number
  notes?: string
}

/**
 * Input schema for updating a settlement
 */
export interface SettlementUpdateInput {
  status?: SettlementStatus
  notes?: string
}

/**
 * Statistics for settlement reporting
 */
export interface SettlementStats {
  groupId: string
  totalSettlements: number
  completedSettlements: number
  pendingSettlements: number
  cancelledSettlements: number
  totalSettledAmount: number // in cents
  pendingAmount: number // in cents
  averageSettlementAmount: number // in cents
  largestSettlement: number // in cents
  settlementsByUser: {
    userId: string
    userName: string
    paidOut: number // in cents (amount they paid to others)
    received: number // in cents (amount they received from others)
    netBalance: number // in cents (positive = net received)
  }[]
  settlementRate: number // percentage of debts that have been settled
}

// Zod validation schemas for runtime validation

/**
 * Schema for validating settlement creation input
 */
export const settlementCreateSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  fromUserId: z.string().uuid('Invalid from user ID'),
  toUserId: z.string().uuid('Invalid to user ID'),
  amount: z.number().int().positive('Amount must be positive'),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.fromUserId !== data.toUserId,
  {
    message: 'From and to users must be different',
    path: ['toUserId'],
  }
)

/**
 * Schema for validating settlement update input
 */
export const settlementUpdateSchema = z.object({
  status: z.nativeEnum(SettlementStatus).optional(),
  notes: z.string().max(500).optional().nullable(),
})

/**
 * Schema for validating settlement status
 */
export const settlementStatusSchema = z.nativeEnum(SettlementStatus)

// Type inference from schemas
export type SettlementCreateInputSchema = z.infer<typeof settlementCreateSchema>
export type SettlementUpdateInputSchema = z.infer<typeof settlementUpdateSchema>

// Helper functions for settlement-related operations

/**
 * Validates a settlement amount
 */
export function isValidSettlementAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0
}

/**
 * Formats settlement amount for display
 */
export function formatSettlementAmount(amount: number, currencyCode: string): string {
  const amountInDollars = amount / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  })
  return formatter.format(amountInDollars)
}

/**
 * Checks if a settlement is pending
 */
export function isSettlementPending(settlement: Settlement): boolean {
  return settlement.status === SettlementStatus.PENDING
}

/**
 * Checks if a settlement is completed
 */
export function isSettlementCompleted(settlement: Settlement): boolean {
  return settlement.status === SettlementStatus.COMPLETED
}

/**
 * Checks if a settlement is cancelled
 */
export function isSettlementCancelled(settlement: Settlement): boolean {
  return settlement.status === SettlementStatus.CANCELLED
}

/**
 * Checks if a settlement can be modified
 */
export function canModifySettlement(settlement: Settlement): boolean {
  return settlement.status === SettlementStatus.PENDING
}

/**
 * Creates a debt object
 */
export function createDebt(
  fromUserId: string,
  toUserId: string,
  amount: number,
  currencyCode: string
): Debt {
  return {
    fromUserId,
    toUserId,
    amount,
    currencyCode,
  }
}

/**
 * Combines two debts between the same users
 */
export function combineDebts(debts: Debt[]): Debt[] {
  const debtMap = new Map<string, Debt>()

  for (const debt of debts) {
    const key = `${debt.fromUserId}-${debt.toUserId}-${debt.currencyCode}`
    const existing = debtMap.get(key)

    if (existing) {
      existing.amount += debt.amount
    } else {
      debtMap.set(key, { ...debt })
    }
  }

  return Array.from(debtMap.values()).filter((d) => d.amount > 0)
}

/**
 * Removes opposite debts (A owes B and B owes A)
 */
export function netOppositeDebts(debts: Debt[]): Debt[] {
  const nettedDebts: Debt[] = []
  const processed = new Set<string>()

  for (const debt of debts) {
    const key1 = `${debt.fromUserId}-${debt.toUserId}`
    const key2 = `${debt.toUserId}-${debt.fromUserId}`

    if (processed.has(key1) || processed.has(key2)) continue

    // Find opposite debt
    const opposite = debts.find(
      (d) => d.fromUserId === debt.toUserId && d.toUserId === debt.fromUserId
    )

    if (opposite) {
      const netAmount = debt.amount - opposite.amount
      if (netAmount > 0) {
        nettedDebts.push({ ...debt, amount: netAmount })
      } else if (netAmount < 0) {
        nettedDebts.push({ ...opposite, amount: -netAmount })
      }
      processed.add(key1)
      processed.add(key2)
    } else {
      nettedDebts.push(debt)
      processed.add(key1)
    }
  }

  return nettedDebts
}

/**
 * Calculates optimal settlement plan to minimize transactions
 * Uses a greedy algorithm that always settles the largest debt first
 */
export function calculateOptimalSettlementPlan(debts: Debt[]): SettlementPlan {
  if (debts.length === 0) {
    return {
      groupId: '',
      currencyCode: '',
      settlements: [],
      transactionCount: 0,
      originalDebtCount: 0,
      calculatedAt: new Date(),
    }
  }

  const currencyCode = debts[0].currencyCode
  const groupId = debts[0].groupId || ''

  // Calculate net balance for each user
  const balances = new Map<string, number>()

  for (const debt of debts) {
    const fromBalance = balances.get(debt.fromUserId) ?? 0
    const toBalance = balances.get(debt.toUserId) ?? 0

    balances.set(debt.fromUserId, fromBalance - debt.amount)
    balances.set(debt.toUserId, toBalance + debt.amount)
  }

  // Separate debtors and creditors
  const debtors: { userId: string; amount: number }[] = []
  const creditors: { userId: string; amount: number }[] = []

  for (const [userId, balance] of balances.entries()) {
    if (balance < 0) {
      debtors.push({ userId, amount: -balance })
    } else if (balance > 0) {
      creditors.push({ userId, amount: balance })
    }
  }

  // Sort by amount (largest first for optimization)
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  // Generate settlement transactions
  const settlements: { fromUserId: string; toUserId: string; amount: number }[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0) {
      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount,
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount === 0) i++
    if (creditor.amount === 0) j++
  }

  return {
    groupId,
    currencyCode,
    settlements,
    transactionCount: settlements.length,
    originalDebtCount: debts.length,
    calculatedAt: new Date(),
  }
}

/**
 * Calculates debt graph from expenses and existing settlements
 */
export function calculateDebtGraph(
  expenses: Array<{
    id: string
    amount: number
    paidById: string
    splits: Array<{ userId: string; amount: number; isSettled: boolean }>
  }>,
  existingSettlements: Settlement[]
): DebtGraph {
  if (expenses.length === 0) {
    return {
      groupId: '',
      currencyCode: 'USD',
      debts: [],
      calculatedAt: new Date(),
      totalDebt: 0,
    }
  }

  const groupId = expenses[0].groupId || ''
  const currencyCode = expenses[0].currencyCode || 'USD'
  const debts: Debt[] = []

  // Calculate debts from expenses
  for (const expense of expenses) {
    for (const split of expense.splits) {
      // Skip if split is for the payer or is already settled
      if (split.userId === expense.paidById || split.isSettled) {
        continue
      }

      debts.push({
        fromUserId: split.userId,
        toUserId: expense.paidById,
        amount: split.amount,
        currencyCode,
      })
    }
  }

  // Subtract completed settlements
  for (const settlement of existingSettlements) {
    if (settlement.status !== SettlementStatus.COMPLETED) {
      continue
    }

    const existingDebtIndex = debts.findIndex(
      (d) =>
        d.fromUserId === settlement.fromUserId &&
        d.toUserId === settlement.toUserId
    )

    if (existingDebtIndex >= 0) {
      debts[existingDebtIndex].amount -= settlement.amount

      // Remove debt if fully settled
      if (debts[existingDebtIndex].amount <= 0) {
        debts.splice(existingDebtIndex, 1)
      }
    }
  }

  // Combine and net debts
  const combinedDebts = combineDebts(debts)
  const nettedDebts = netOppositeDebts(combinedDebts)

  const totalDebt = nettedDebts.reduce((sum, debt) => sum + debt.amount, 0)

  return {
    groupId,
    currencyCode,
    debts: nettedDebts,
    calculatedAt: new Date(),
    totalDebt,
  }
}

/**
 * Gets settlement status display text
 */
export function getSettlementStatusText(status: SettlementStatus): string {
  const texts: Record<SettlementStatus, string> = {
    [SettlementStatus.PENDING]: 'Pending',
    [SettlementStatus.COMPLETED]: 'Completed',
    [SettlementStatus.CANCELLED]: 'Cancelled',
  }
  return texts[status] || status
}

/**
 * Gets settlement status color for UI
 */
export function getSettlementStatusColor(status: SettlementStatus): string {
  const colors: Record<SettlementStatus, string> = {
    [SettlementStatus.PENDING]: 'yellow',
    [SettlementStatus.COMPLETED]: 'green',
    [SettlementStatus.CANCELLED]: 'gray',
  }
  return colors[status] || 'gray'
}

/**
 * Calculates how much a user owes in total
 */
export function calculateUserTotalOwed(
  userId: string,
  debtGraph: DebtGraph
): number {
  return debtGraph.debts
    .filter((d) => d.fromUserId === userId)
    .reduce((sum, debt) => sum + debt.amount, 0)
}

/**
 * Calculates how much a user is owed in total
 */
export function calculateUserTotalOwing(
  userId: string,
  debtGraph: DebtGraph
): number {
  return debtGraph.debts
    .filter((d) => d.toUserId === userId)
    .reduce((sum, debt) => sum + debt.amount, 0)
}

/**
 * Calculates a user's net balance
 */
export function calculateUserNetBalance(
  userId: string,
  debtGraph: DebtGraph
): number {
  const totalOwed = calculateUserTotalOwed(userId, debtGraph)
  const totalOwing = calculateUserTotalOwing(userId, debtGraph)
  return totalOwing - totalOwed
}

/**
 * Formats settlement date for display
 */
export function formatSettlementDate(date: Date): string {
  const now = new Date()
  const settlementDate = new Date(date)
  const daysDiff = Math.floor((now.getTime() - settlementDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) return 'Today'
  if (daysDiff === 1) return 'Yesterday'
  if (daysDiff < 7) return `${daysDiff} days ago`

  return settlementDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: settlementDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Validates that a settlement amount doesn't exceed the debt
 */
export function validateSettlementAmount(
  amount: number,
  debt: Debt
): boolean {
  return amount > 0 && amount <= debt.amount
}

/**
 * Generates a settlement description
 */
export function generateSettlementDescription(
  fromUserName: string,
  toUserName: string,
  amount: number,
  currencyCode: string
): string {
  const formattedAmount = formatSettlementAmount(amount, currencyCode)
  return `${fromUserName} pays ${toUserName} ${formattedAmount}`
}

/**
 * Checks if a user is involved in a settlement
 */
export function isUserInvolvedInSettlement(
  userId: string,
  settlement: Settlement
): boolean {
  return settlement.fromUserId === userId || settlement.toUserId === userId
}

/**
 * Checks if a settlement is overdue (pending for more than 30 days)
 */
export function isSettlementOverdue(settlement: Settlement): boolean {
  if (settlement.status !== SettlementStatus.PENDING) {
    return false
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return settlement.createdAt < thirtyDaysAgo
}

/**
 * Gets settlement completion percentage for a group
 */
export function calculateSettlementCompletionRate(
  totalDebt: number,
  settledAmount: number
): number {
  if (totalDebt === 0) return 100
  return Math.round((settledAmount / totalDebt) * 100)
}

/**
 * Prioritizes settlements by amount (largest first)
 */
export function prioritizeSettlementsByAmount(
  settlements: Settlement[]
): Settlement[] {
  return [...settlements].sort((a, b) => b.amount - a.amount)
}

/**
 * Prioritizes settlements by age (oldest first)
 */
export function prioritizeSettlementsByAge(
  settlements: Settlement[]
): Settlement[] {
  return [...settlements].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}
