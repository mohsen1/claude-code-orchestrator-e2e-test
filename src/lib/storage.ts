import { Expense, CreateExpenseInput } from '@/types';

// In-memory storage for expenses
let expenses: Expense[] = [];

/**
 * Generate a unique ID for an expense
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Add a new expense to the in-memory storage
 * @param input - The expense data (description and amount)
 * @returns The newly created expense with generated id and timestamp
 */
export function addExpense(input: CreateExpenseInput): Expense {
  const newExpense: Expense = {
    id: generateId(),
    description: input.description,
    amount: input.amount,
    createdAt: new Date(),
  };

  expenses.push(newExpense);
  return newExpense;
}

/**
 * Get all expenses from in-memory storage
 * @returns Array of all expenses, sorted by creation date (newest first)
 */
export function listExpenses(): Expense[] {
  // Return a copy of the array to prevent external mutations
  return [...expenses].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Calculate the total amount of all expenses
 * @returns The sum of all expense amounts
 */
export function getTotalExpense(): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Clear all expenses (useful for testing or reset functionality)
 * @returns Empty array
 */
export function clearExpenses(): Expense[] {
  expenses = [];
  return expenses;
}

/**
 * Get the current count of expenses
 * @returns The number of expenses stored
 */
export function getExpenseCount(): number {
  return expenses.length;
}
