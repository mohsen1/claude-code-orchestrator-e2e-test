import type { BaseEntity, CurrencyCode, ExpenseCategory, MoneyAmount, PublicUserProfile } from './index';

// ============================================================================
// EXPENSE TYPES
// ============================================================================

/**
 * Expense entity from database
 * All monetary values are stored as integer cents
 */
export interface Expense extends BaseEntity {
  groupId: string;
  description: string;
  amount: MoneyAmount;
  currency: CurrencyCode;
  paidBy: string;
  category: ExpenseCategory;
  date: Date;
  notes: string | null;
  receiptUrl: string | null;
  isRecurring: boolean;
  recurringExpenseId: string | null;
  deletedAt: Date | null;
}

/**
 * Expense with related data included
 */
export interface ExpenseWithDetails extends Expense {
  paidByUser: PublicUserProfile;
  splits: ExpenseSplit[];
  attachments: ExpenseAttachment[];
  group: {
    id: string;
    name: string;
    currency: CurrencyCode;
  };
}

/**
 * Expense split - how an expense is divided among users
 * For equal splits, amount is calculated as expense.amount / group.memberCount
 */
export interface ExpenseSplit extends BaseEntity {
  expenseId: string;
  userId: string;
  amount: MoneyAmount;
  percentage: number; // For percentage-based splits (future feature)
  isPaid: boolean; // For tracking if this split has been settled
}

/**
 * Expense attachment (receipts, invoices, etc.)
 */
export interface ExpenseAttachment extends BaseEntity {
  expenseId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  mimeType: string;
  uploadedBy: string;
}

/**
 * Recurring expense configuration
 */
export interface RecurringExpense extends BaseEntity {
  groupId: string;
  name: string;
  description: string;
  amount: MoneyAmount;
  currency: CurrencyCode;
  category: ExpenseCategory;
  paidBy: string;
  frequency: RecurringFrequency;
  interval: number; // Combined with frequency (e.g., every 2 weeks)
  dayOfMonth: number | null; // For monthly expenses (1-31)
  dayOfWeek: number | null; // For weekly expenses (0-6, Sunday = 0)
  endDate: Date | null; // null = continues indefinitely
  lastGeneratedDate: Date | null;
  nextDueDate: Date;
  isActive: boolean;
}

/**
 * Recurring expense frequencies
 */
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Expense creation input
 */
export interface CreateExpenseInput {
  groupId: string;
  description: string;
  amount: MoneyAmount;
  currency?: CurrencyCode;
  paidBy: string;
  category: ExpenseCategory;
  date?: Date;
  notes?: string;
  receipt?: File | string;
  splitBetween?: string[]; // User IDs to split between (default: all group members)
  splitType?: SplitType;
  customSplits?: CustomSplitInput[]; // For custom split amounts
}

/**
 * Expense update input
 */
export interface UpdateExpenseInput {
  description?: string;
  amount?: MoneyAmount;
  category?: ExpenseCategory;
  date?: Date;
  notes?: string | null;
  receiptUrl?: string | null;
  splitBetween?: string[];
  customSplits?: CustomSplitInput[];
}

/**
 * Split types for expenses
 */
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

/**
 * Custom split input for exact amounts or percentages
 */
export interface CustomSplitInput {
  userId: string;
  amount?: MoneyAmount; // For exact splits
  percentage?: number; // For percentage splits (0-100)
  shares?: number; // For share-based splits
}

/**
 * Expense filters for queries
 */
export interface ExpenseFilters {
  groupId?: string;
  paidBy?: string;
  category?: ExpenseCategory;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: MoneyAmount;
  maxAmount?: MoneyAmount;
  currency?: CurrencyCode;
  includeDeleted?: boolean;
  isRecurring?: boolean;
  searchTerm?: string; // Search in description and notes
}

/**
 * Expense query parameters
 */
export interface ExpenseQueryParams {
  filters: ExpenseFilters;
  pagination: {
    page: number;
    pageSize: number;
  };
  sort: {
    field: 'date' | 'amount' | 'createdAt' | 'description';
    order: 'asc' | 'desc';
  };
}

/**
 * Expense statistics for a user in a group
 */
export interface ExpenseStats {
  totalExpenses: number;
  totalSpent: MoneyAmount;
  totalOwed: MoneyAmount;
  totalOwing: MoneyAmount;
  expenseCount: number;
  categoryBreakdown: CategoryBreakdown[];
  recentExpenses: Expense[];
}

/**
 * Expense breakdown by category
 */
export interface CategoryBreakdown {
  category: ExpenseCategory;
  count: number;
  total: MoneyAmount;
  percentage: number;
}

/**
 * Monthly expense summary
 */
export interface MonthlyExpenseSummary {
  year: number;
  month: number; // 1-12
  total: MoneyAmount;
  expenseCount: number;
  averagePerExpense: MoneyAmount;
  categoryBreakdown: CategoryBreakdown[];
}

/**
 * Expense export format
 */
export interface ExpenseExport {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: string;
  splits: {
    userId: string;
    userName: string;
    amount: number;
  }[];
}

/**
 * Expense validation error details
 */
export interface ExpenseValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Expense creation result
 */
export interface ExpenseCreationResult {
  expense: Expense;
  splits: ExpenseSplit[];
  balancesUpdated: BalanceUpdate[];
}

/**
 * Balance update from expense creation
 */
export interface BalanceUpdate {
  userId: string;
  oldBalance: MoneyAmount;
  newBalance: MoneyAmount;
  change: MoneyAmount;
}

/**
 * Expense deletion result
 */
export interface ExpenseDeletionResult {
  expenseId: string;
  splitsDeleted: number;
  balancesRestored: BalanceUpdate[];
}

/**
 * Bulk expense operations
 */
export interface BulkExpenseInput {
  groupId: string;
  expenses: Omit<CreateExpenseInput, 'groupId'>[];
}

/**
 * Bulk expense result
 */
export interface BulkExpenseResult {
  succeeded: ExpenseCreationResult[];
  failed: Array<{
    input: Omit<CreateExpenseInput, 'groupId'>;
    error: string;
  }>;
}

/**
 * Expense comment (for collaboration)
 */
export interface ExpenseComment extends BaseEntity {
  expenseId: string;
  userId: string;
  content: string;
  editedAt: Date | null;
  deletedAt: Date | null;
}

/**
 * Expense reaction (emoji reactions to expenses)
 */
export interface ExpenseReaction extends BaseEntity {
  expenseId: string;
  userId: string;
  emoji: string; // Unicode emoji or custom emoji code
}

/**
 * Expense history audit log
 */
export interface ExpenseHistoryLog extends BaseEntity {
  expenseId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  changes: ExpenseChange[] | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Individual field change in expense history
 */
export interface ExpenseChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Expense share link
 */
export interface ExpenseShareLink {
  id: string;
  expenseId: string;
  token: string;
  expiresAt: Date | null;
  accessedCount: number;
  maxAccessCount: number | null;
  createdBy: string;
  createdAt: Date;
}
