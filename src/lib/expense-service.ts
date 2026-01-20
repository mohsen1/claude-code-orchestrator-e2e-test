/**
 * Expense Service Layer
 * Provides validation, formatting, and aggregation helpers for expense management
 */

// ============================================
// Types
// ============================================

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
}

export interface ExpenseValidationError {
  field: 'description' | 'amount';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ExpenseValidationError[];
}

export interface ExpenseSummary {
  total: number;
  count: number;
  average: number;
}

// ============================================
// Validation
// ============================================

/**
 * Validate expense description
 */
export function validateDescription(description: string): ValidationResult {
  const errors: ExpenseValidationError[] = [];

  if (!description || description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Description is required'
    });
  } else if (description.trim().length < 3) {
    errors.push({
      field: 'description',
      message: 'Description must be at least 3 characters long'
    });
  } else if (description.length > 200) {
    errors.push({
      field: 'description',
      message: 'Description must not exceed 200 characters'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate expense amount
 */
export function validateAmount(amount: number | string): ValidationResult {
  const errors: ExpenseValidationError[] = [];

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a valid number'
    });
  } else if (numAmount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0'
    });
  } else if (numAmount > 1000000) {
    errors.push({
      field: 'amount',
      message: 'Amount must not exceed 1,000,000'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete expense data
 */
export function validateExpense(data: {
  description: string;
  amount: number | string;
}): ValidationResult {
  const descriptionResult = validateDescription(data.description);
  const amountResult = validateAmount(data.amount);

  const errors = [
    ...descriptionResult.errors,
    ...amountResult.errors
  ];

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================
// Formatting
// ============================================

/**
 * Format amount as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Format expense for display
 */
export function formatExpense(expense: Expense): string {
  const formattedAmount = formatCurrency(expense.amount);
  const formattedDate = formatDate(expense.createdAt);
  return `${expense.description} - ${formattedAmount} (${formattedDate})`;
}

/**
 * Sanitize description (trim and normalize whitespace)
 */
export function sanitizeDescription(description: string): string {
  return description.trim().replace(/\s+/g, ' ');
}

/**
 * Parse and sanitize amount from input
 */
export function parseAmount(amount: string | number): number {
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

// ============================================
// Aggregation
// ============================================

/**
 * Calculate total of all expenses
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate expense summary statistics
 */
export function calculateSummary(expenses: Expense[]): ExpenseSummary {
  const total = calculateTotal(expenses);
  const count = expenses.length;
  const average = count > 0 ? total / count : 0;

  return {
    total: Math.round(total * 100) / 100,
    count,
    average: Math.round(average * 100) / 100
  };
}

/**
 * Group expenses by date
 */
export function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  const grouped = new Map<string, Expense[]>();

  expenses.forEach(expense => {
    const dateKey = new Date(expense.createdAt).toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(expense);
  });

  return grouped;
}

/**
 * Get daily totals
 */
export function getDailyTotals(expenses: Expense[]): Map<string, number> {
  const dailyTotals = new Map<string, number>();

  expenses.forEach(expense => {
    const dateKey = new Date(expense.createdAt).toDateString();
    const currentTotal = dailyTotals.get(dateKey) || 0;
    dailyTotals.set(dateKey, currentTotal + expense.amount);
  });

  return dailyTotals;
}

/**
 * Sort expenses by date (newest first)
 */
export function sortByDate(expenses: Expense[], descending: boolean = true): Expense[] {
  return [...expenses].sort((a, b) => {
    const dateA = a.createdAt.getTime();
    const dateB = b.createdAt.getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Sort expenses by amount (highest first)
 */
export function sortByAmount(expenses: Expense[], descending: boolean = true): Expense[] {
  return [...expenses].sort((a, b) => {
    return descending ? b.amount - a.amount : a.amount - b.amount;
  });
}

/**
 * Filter expenses by search term
 */
export function filterBySearchTerm(expenses: Expense[], searchTerm: string): Expense[] {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return expenses;

  return expenses.filter(expense =>
    expense.description.toLowerCase().includes(term)
  );
}

/**
 * Filter expenses by minimum amount
 */
export function filterByMinAmount(expenses: Expense[], minAmount: number): Expense[] {
  return expenses.filter(expense => expense.amount >= minAmount);
}

/**
 * Filter expenses by maximum amount
 */
export function filterByMaxAmount(expenses: Expense[], maxAmount: number): Expense[] {
  return expenses.filter(expense => expense.amount <= maxAmount);
}

/**
 * Filter expenses by date range
 */
export function filterByDateRange(
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = expense.createdAt.getTime();
    return expenseDate >= startDate.getTime() && expenseDate <= endDate.getTime();
  });
}

// ============================================
// Helpers
// ============================================

/**
 * Generate unique ID for new expense
 */
export function generateExpenseId(): string {
  return `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new expense object
 */
export function createExpense(data: {
  description: string;
  amount: number | string;
}): Expense | null {
  // Validate input
  const validation = validateExpense(data);
  if (!validation.isValid) {
    return null;
  }

  // Sanitize and parse input
  const sanitizedDescription = sanitizeDescription(data.description);
  const parsedAmount = parseAmount(data.amount);

  // Create expense object
  return {
    id: generateExpenseId(),
    description: sanitizedDescription,
    amount: parsedAmount,
    createdAt: new Date()
  };
}

/**
 * Check if two expenses are equal
 */
export function areExpensesEqual(a: Expense, b: Expense): boolean {
  return (
    a.id === b.id &&
    a.description === b.description &&
    a.amount === b.amount &&
    a.createdAt.getTime() === b.createdAt.getTime()
  );
}

/**
 * Clone an expense (deep copy)
 */
export function cloneExpense(expense: Expense): Expense {
  return {
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    createdAt: new Date(expense.createdAt)
  };
}
