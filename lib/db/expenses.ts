import Database from 'better-sqlite3';
import { getDatabase } from './index';

export interface Expense {
  id: number;
  group_id: number;
  payer_id: number;
  amount: number;
  description: string;
  category?: string;
  expense_date: string;
  created_at: string;
}

export interface CreateExpenseInput {
  group_id: number;
  payer_id: number;
  amount: number;
  description: string;
  category?: string;
  expense_date?: string;
}

/**
 * Create a new expense
 */
export function createExpense(input: CreateExpenseInput): Expense {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO expenses (group_id, payer_id, amount, description, category, expense_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.group_id,
    input.payer_id,
    input.amount,
    input.description,
    input.category || null,
    input.expense_date || new Date().toISOString()
  );

  const expense = getExpenseById(result.lastInsertRowid as number);
  if (!expense) {
    throw new Error('Failed to create expense');
  }

  return expense;
}

/**
 * Get expense by ID
 */
export function getExpenseById(id: number): Expense | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM expenses WHERE id = ?
  `);

  return stmt.get(id) as Expense | null;
}

/**
 * Get all expenses for a group
 */
export function getExpensesByGroupId(groupId: number): Expense[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM expenses
    WHERE group_id = ?
    ORDER BY expense_date DESC, created_at DESC
  `);

  return stmt.all(groupId) as Expense[];
}

/**
 * Get expenses for a group with payer details
 */
export function getExpensesWithPayerDetails(groupId: number): Array<Expense & { payer_name: string; payer_email: string }> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      e.*,
      u.name as payer_name,
      u.email as payer_email
    FROM expenses e
    JOIN users u ON e.payer_id = u.id
    WHERE e.group_id = ?
    ORDER BY e.expense_date DESC, e.created_at DESC
  `);

  return stmt.all(groupId) as Array<Expense & { payer_name: string; payer_email: string }>;
}

/**
 * Update an expense
 */
export function updateExpense(
  id: number,
  updates: Partial<Omit<CreateExpenseInput, 'group_id' | 'payer_id'>>
): Expense | null {
  const db = getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.amount !== undefined) {
    fields.push('amount = ?');
    values.push(updates.amount);
  }

  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }

  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }

  if (updates.expense_date !== undefined) {
    fields.push('expense_date = ?');
    values.push(updates.expense_date);
  }

  if (fields.length === 0) {
    return getExpenseById(id);
  }

  const stmt = db.prepare(`
    UPDATE expenses
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  values.push(id);
  stmt.run(...values);

  return getExpenseById(id);
}

/**
 * Delete an expense
 */
export function deleteExpense(id: number): boolean {
  const db = getDatabase();

  // First, delete all expense splits associated with this expense
  const deleteSplitsStmt = db.prepare(`
    DELETE FROM expense_splits WHERE expense_id = ?
  `);
  deleteSplitsStmt.run(id);

  // Then delete the expense
  const stmt = db.prepare(`
    DELETE FROM expenses WHERE id = ?
  `);

  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Get total expenses for a group
 */
export function getTotalExpensesForGroup(groupId: number): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE group_id = ?
  `);

  const result = stmt.get(groupId) as { total: number };
  return result.total;
}

/**
 * Get expenses paid by a user in a group
 */
export function getExpensesByPayer(groupId: number, payerId: number): Expense[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM expenses
    WHERE group_id = ? AND payer_id = ?
    ORDER BY expense_date DESC, created_at DESC
  `);

  return stmt.all(groupId, payerId) as Expense[];
}

/**
 * Get user's share of expenses in a group
 */
export function getUserExpenseShare(groupId: number, userId: number): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expense_splits
    WHERE expense_id IN (
      SELECT id FROM expenses WHERE group_id = ?
    )
    AND user_id = ?
  `);

  const result = stmt.get(groupId, userId) as { total: number };
  return result.total;
}
