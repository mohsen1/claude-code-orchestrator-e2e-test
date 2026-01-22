import type { BaseEntity, CurrencyCode, MoneyAmount, PaymentMethod, PublicUserProfile } from './index';

// ============================================================================
// SETTLEMENT TYPES
// ============================================================================

/**
 * Settlement status tracking the payment flow
 */
export type SettlementStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';

/**
 * Settlement entity representing a payment between users
 */
export interface Settlement extends BaseEntity {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: MoneyAmount;
  currency: CurrencyCode;
  status: SettlementStatus;
  paymentMethod: PaymentMethod | null;
  paymentReference: string | null; // Transaction ID, confirmation number, etc.
  completedAt: Date | null;
  cancelledAt: Date | null;
  notes: string | null;
  relatedExpenseIds: string[]; // IDs of expenses being settled
  proofOfPaymentUrl: string | null;
  verifiedBy: string | null; // User who verified the payment
  verifiedAt: Date | null;
}

/**
 * Settlement with related user data
 */
export interface SettlementWithDetails extends Settlement {
  fromUser: PublicUserProfile;
  toUser: PublicUserProfile;
  group: {
    id: string;
    name: string;
  };
}

/**
 * Settlement creation input
 */
export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: MoneyAmount;
  currency: CurrencyCode;
  paymentMethod?: PaymentMethod;
  notes?: string;
  relatedExpenseIds?: string[];
}

/**
 * Settlement update input
 */
export interface UpdateSettlementInput {
  status?: SettlementStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  notes?: string | null;
  proofOfPaymentUrl?: string;
}

/**
 * Settlement confirmation input
 */
export interface ConfirmSettlementInput {
  settlementId: string;
  proofOfPaymentUrl?: string;
  paymentReference?: string;
  verified?: boolean; // Auto-verify if true
}

/**
 * Settlement cancellation input
 */
export interface CancelSettlementInput {
  settlementId: string;
  reason?: string;
}

/**
 * User balance in a group
 * Positive balance = owed money (others owe them)
 * Negative balance = owes money
 */
export interface UserBalance {
  groupId: string;
  userId: string;
  balance: MoneyAmount;
  totalOwed: MoneyAmount; // Total amount owed to this user
  totalOwing: MoneyAmount; // Total amount this user owes
  lastCalculatedAt: Date;
}

/**
 * User balance with user data
 */
export interface UserBalanceWithDetails extends UserBalance {
  user: PublicUserProfile;
}

/**
 * Debt graph node representing a user's net position
 */
export interface DebtNode {
  userId: string;
  userName: string;
  userImage: string | null;
  netBalance: MoneyAmount; // Positive = creditor, Negative = debtor
  totalReceivable: MoneyAmount;
  totalPayable: MoneyAmount;
}

/**
 * Debt graph edge representing a debt relationship
 */
export interface DebtEdge {
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  amount: MoneyAmount;
  currency: CurrencyCode;
}

/**
 * Optimized settlement suggestion
 * Calculated to minimize total number of transactions
 */
export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: MoneyAmount;
  currency: CurrencyCode;
  relatedExpenseIds: string[];
}

/**
 * Settlement plan - optimal set of transactions to settle all debts
 */
export interface SettlementPlan {
  groupId: string;
  currency: CurrencyCode;
  totalAmount: MoneyAmount;
  transactionCount: number;
  savings: MoneyAmount; // Amount saved compared to individual settlements
  suggestions: SettlementSuggestion[];
  generatedAt: Date;
}

/**
 * Debt calculation result for a group
 */
export interface GroupDebtCalculation {
  groupId: string;
  currency: CurrencyCode;
  balances: UserBalanceWithDetails[];
  debtGraph: DebtEdge[];
  settlementPlan: SettlementPlan;
  totalDebt: MoneyAmount;
  creditorCount: number;
  debtorCount: number;
  calculatedAt: Date;
}

/**
 * Settlement filters for queries
 */
export interface SettlementFilters {
  groupId?: string;
  fromUserId?: string;
  toUserId?: string;
  status?: SettlementStatus;
  currency?: CurrencyCode;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: MoneyAmount;
  maxAmount?: MoneyAmount;
  includeVerified?: boolean;
}

/**
 * Settlement query parameters
 */
export interface SettlementQueryParams {
  filters: SettlementFilters;
  pagination: {
    page: number;
    pageSize: number;
  };
  sort: {
    field: 'createdAt' | 'amount' | 'completedAt' | 'status';
    order: 'asc' | 'desc';
  };
}

/**
 * Settlement statistics for a user
 */
export interface SettlementStats {
  totalPaid: MoneyAmount;
  totalReceived: MoneyAmount;
  pendingPayments: MoneyAmount;
  pendingReceipts: MoneyAmount;
  completedPayments: number;
  pendingPaymentsCount: number;
  averagePaymentAmount: MoneyAmount;
  mostPaidToUser?: {
    userId: string;
    userName: string;
    total: MoneyAmount;
  };
  mostReceivedFromUser?: {
    userId: string;
    userName: string;
    total: MoneyAmount;
  };
}

/**
 * Settlement payment reminder
 */
export interface SettlementReminder extends BaseEntity {
  settlementId: string;
  groupId: string;
  sentTo: string; // User ID
  sentBy: string; // User ID who sent the reminder
  message: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  status: 'pending' | 'sent' | 'cancelled';
}

/**
 * Settlement schedule for recurring payments
 */
export interface SettlementSchedule extends BaseEntity {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: MoneyAmount;
  currency: CurrencyCode;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  dayOfMonth: number | null; // 1-31 for monthly payments
  dayOfWeek: number | null; // 0-6 for weekly payments
  startDate: Date;
  endDate: Date | null;
  nextPaymentDate: Date;
  paymentMethod: PaymentMethod | null;
  isActive: boolean;
  autoConfirm: boolean; // Automatically mark as complete on due date
}

/**
 * Settlement history export
 */
export interface SettlementHistoryExport {
  settlementId: string;
  date: string;
  fromUser: string;
  toUser: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  completedAt: string | null;
  relatedExpenses: string[];
}

/**
 * Payment proof verification
 */
export interface PaymentProofVerification {
  settlementId: string;
  verified: boolean;
  verifiedBy: string;
  verifiedAt: Date;
  notes: string | null;
  proofUrl: string | null;
}

/**
 * Settlement dispute
 */
export interface SettlementDispute extends BaseEntity {
  settlementId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolvedBy: string | null;
  resolvedAt: Date | null;
  resolution: string | null;
}

/**
 * Batch settlement operations
 */
export interface BatchSettlementInput {
  groupId: string;
  settlements: Omit<CreateSettlementInput, 'groupId'>[];
  autoConfirm?: boolean;
}

/**
 * Batch settlement result
 */
export interface BatchSettlementResult {
  successful: Settlement[];
  failed: Array<{
    input: Omit<CreateSettlementInput, 'groupId'>;
    error: string;
  }>;
  totalAmount: MoneyAmount;
  transactionCount: number;
}

/**
 * Settlement webhook payload for external integrations
 */
export interface SettlementWebhookPayload {
  event: 'settlement.created' | 'settlement.completed' | 'settlement.failed' | 'settlement.cancelled';
  settlement: SettlementWithDetails;
  timestamp: Date;
  groupId: string;
}

/**
 * Currency conversion for settlements
 */
export interface CurrencyConversionRequest {
  amount: MoneyAmount;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  settlementId?: string;
}

/**
 * Currency conversion result
 */
export interface CurrencyConversionResult {
  originalAmount: MoneyAmount;
  originalCurrency: CurrencyCode;
  convertedAmount: MoneyAmount;
  targetCurrency: CurrencyCode;
  exchangeRate: number;
  timestamp: Date;
}

/**
 * Settlement fee calculation
 */
export interface SettlementFee {
  amount: MoneyAmount;
  currency: CurrencyCode;
  feePercentage: number;
  feeAmount: MoneyAmount;
  totalAmount: MoneyAmount; // amount + feeAmount
  paymentMethod: PaymentMethod;
}
