import Database from 'better-sqlite3';

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  expense_date: string;
  category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  percentage: number;
}

export interface ExpenseWithSplits extends Expense {
  splits: Array<{
    user_id: string;
    amount: number;
    percentage: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  paid_by_user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateExpenseInput {
  group_id: string;
  description: string;
  amount: number;
  currency?: string;
  paid_by: string;
  expense_date?: string;
  category?: string;
  notes?: string;
  splits: Array<{
    user_id: string;
    amount?: number;
    percentage?: string;
  }>;
}

/**
 * Database error wrapper
 */
function handleDatabaseError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`Duplicate entry for ${operation}`);
    }
    throw new Error(`Database error during ${operation}: ${error.message}`);
  }
  throw new Error(`Unknown error during ${operation}`);
}

/**
 * Get expense by ID
 */
export function getExpenseById(db: Database.Database, expenseId: string): Expense | null {
  try {
    const stmt = db.prepare(`
      SELECT * FROM expenses
      WHERE id = ?
      LIMIT 1
    `);

    const expense = stmt.get(expenseId) as Expense | undefined;
    return expense || null;
  } catch (error) {
    handleDatabaseError('getExpenseById', error);
  }
}

/**
 * Get expense by ID with splits
 */
export function getExpenseWithSplits(db: Database.Database, expenseId: string): ExpenseWithSplits | null {
  try {
    const expense = getExpenseById(db, expenseId);
    if (!expense) {
      return null;
    }

    // Get paid by user
    const paidByStmt = db.prepare(`
      SELECT id, name, email FROM users WHERE id = ?
    `);
    const paidByUser = paidByStmt.get(expense.paid_by) as { id: string; name: string; email: string };

    // Get splits with user info
    const splitsStmt = db.prepare(`
      SELECT es.user_id, es.amount, es.percentage, u.name, u.email
      FROM expense_splits es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);

    const splits = splitsStmt.all(expenseId) as Array<{
      user_id: string;
      amount: number;
      percentage: number;
      name: string;
      email: string;
    }>;

    return {
      ...expense,
      splits: splits.map(split => ({
        user_id: split.user_id,
        amount: split.amount,
        percentage: split.percentage,
        user: {
          id: split.user_id,
          name: split.name,
          email: split.email,
        },
      })),
      paid_by_user: paidByUser,
    };
  } catch (error) {
    handleDatabaseError('getExpenseWithSplits', error);
  }
}

/**
 * Get expenses by group ID
 */
export function getExpensesByGroupId(db: Database.Database, groupId: string): Expense[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM expenses
      WHERE group_id = ?
      ORDER BY expense_date DESC, created_at DESC
    `);

    return stmt.all(groupId) as Expense[];
  } catch (error) {
    handleDatabaseError('getExpensesByGroupId', error);
  }
}

/**
 * Get expenses by group ID with splits
 */
export function getGroupExpensesWithSplits(db: Database.Database, groupId: string): ExpenseWithSplits[] {
  try {
    const expenses = getExpensesByGroupId(db, groupId);

    return expenses.map(expense => {
      const expenseWithSplits = getExpenseWithSplits(db, expense.id);
      return expenseWithSplits || {
        ...expense,
        splits: [],
        paid_by_user: { id: '', name: '', email: '' },
      };
    });
  } catch (error) {
    handleDatabaseError('getGroupExpensesWithSplits', error);
  }
}

/**
 * Get expenses paid by user in a group
 */
export function getExpensesPaidByUser(db: Database.Database, groupId: string, userId: string): Expense[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM expenses
      WHERE group_id = ? AND paid_by = ?
      ORDER BY expense_date DESC
    `);

    return stmt.all(groupId, userId) as Expense[];
  } catch (error) {
    handleDatabaseError('getExpensesPaidByUser', error);
  }
}

/**
 * Get expenses where user is involved (either paid or split)
 */
export function getUserExpensesInGroup(db: Database.Database, groupId: string, userId: string): Expense[] {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT e.* FROM expenses e
      LEFT JOIN expense_splits es ON e.id = es.expense_id
      WHERE e.group_id = ? AND (e.paid_by = ? OR es.user_id = ?)
      ORDER BY e.expense_date DESC
    `);

    return stmt.all(groupId, userId, userId) as Expense[];
  } catch (error) {
    handleDatabaseError('getUserExpensesInGroup', error);
  }
}

/**
 * Create a new expense
 */
export function createExpense(db: Database.Database, input: CreateExpenseInput): Expense {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO expenses (id, group_id, description, amount, currency, paid_by, expense_date, category, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.group_id,
      input.description,
      input.amount,
      input.currency || 'USD',
      input.paid_by,
      input.expense_date || now,
      input.category || null,
      input.notes || null,
      now,
      now
    );

    // Create splits
    for (const split of input.splits) {
      createExpenseSplit(db, {
        expense_id: id,
        user_id: split.user_id,
        amount: split.amount,
        percentage: split.percentage,
      });
    }

    return getExpenseById(db, id)!;
  } catch (error) {
    handleDatabaseError('createExpense', error);
  }
}

/**
 * Update expense information
 */
export function updateExpense(db: Database.Database, expenseId: string, updates: Partial<Omit<Expense, 'id' | 'group_id' | 'created_at' | 'updated_at'>>): Expense | null {
  try {
    const existingExpense = getExpenseById(db, expenseId);
    if (!existingExpense) {
      return null;
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }
    if (updates.currency !== undefined) {
      fields.push('currency = ?');
      values.push(updates.currency);
    }
    if (updates.paid_by !== undefined) {
      fields.push('paid_by = ?');
      values.push(updates.paid_by);
    }
    if (updates.expense_date !== undefined) {
      fields.push('expense_date = ?');
      values.push(updates.expense_date);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      return existingExpense;
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(expenseId);

    const stmt = db.prepare(`
      UPDATE expenses
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return getExpenseById(db, expenseId);
  } catch (error) {
    handleDatabaseError('updateExpense', error);
  }
}

/**
 * Delete expense by ID
 */
export function deleteExpense(db: Database.Database, expenseId: string): boolean {
  try {
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    const result = stmt.run(expenseId);

    // Also delete associated splits
    const deleteSplitsStmt = db.prepare('DELETE FROM expense_splits WHERE expense_id = ?');
    deleteSplitsStmt.run(expenseId);

    return result.changes > 0;
  } catch (error) {
    handleDatabaseError('deleteExpense', error);
  }
}

/**
 * Create expense split
 */
export function createExpenseSplit(db: Database.Database, input: {
  expense_id: string;
  user_id: string;
  amount?: number;
  percentage?: string;
}): ExpenseSplit {
  try {
    const id = crypto.randomUUID();

    const stmt = db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.expense_id, input.user_id, input.amount || null, input.percentage || null);

    return {
      id,
      expense_id: input.expense_id,
      user_id: input.user_id,
      amount: input.amount || 0,
      percentage: input.percentage ? parseFloat(input.percentage) : 0,
    };
  } catch (error) {
    handleDatabaseError('createExpenseSplit', error);
  }
}

/**
 * Get splits for an expense
 */
export function getExpenseSplits(db: Database.Database, expenseId: string): ExpenseSplit[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM expense_splits
      WHERE expense_id = ?
    `);

    return stmt.all(expenseId) as ExpenseSplit[];
  } catch (error) {
    handleDatabaseError('getExpenseSplits', error);
  }
}

/**
 * Update expense split
 */
export function updateExpenseSplit(db: Database.Database, splitId: string, updates: Partial<Omit<ExpenseSplit, 'id' | 'expense_id' | 'user_id'>>): ExpenseSplit | null {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }
    if (updates.percentage !== undefined) {
      fields.push('percentage = ?');
      values.push(updates.percentage);
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(splitId);

    const stmt = db.prepare(`
      UPDATE expense_splits
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    const getStmt = db.prepare('SELECT * FROM expense_splits WHERE id = ?');
    return getStmt.get(splitId) as ExpenseSplit | null;
  } catch (error) {
    handleDatabaseError('updateExpenseSplit', error);
  }
}

/**
 * Delete expense split
 */
export function deleteExpenseSplit(db: Database.Database, splitId: string): boolean {
  try {
    const stmt = db.prepare('DELETE FROM expense_splits WHERE id = ?');
    const result = stmt.run(splitId);
    return result.changes > 0;
  } catch (error) {
    handleDatabaseError('deleteExpenseSplit', error);
  }
}

/**
 * Get total expenses for a group
 */
export function getGroupTotalExpenses(db: Database.Database, groupId: string): number {
  try {
    const stmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE group_id = ?
    `);

    const result = stmt.get(groupId) as { total: number };
    return result.total;
  } catch (error) {
    handleDatabaseError('getGroupTotalExpenses', error);
  }
}
