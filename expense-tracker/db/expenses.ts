import db from '@/lib/db';

export interface Expense {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  paid_by: number;
  created_at: string;
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: number;
  amount: number;
}

export interface ExpenseWithDetails extends Expense {
  paid_by_name: string;
  paid_by_email: string;
  splits: {
    user_id: number;
    user_name: string;
    user_email: string;
    amount: number;
  }[];
}

/**
 * Create a new expense with equal splits among group members
 */
export function createExpense(
  groupId: number,
  description: string,
  amount: number,
  paidBy: number
): Expense {
  const stmt = db.prepare(`
    INSERT INTO expenses (group_id, description, amount, paid_by)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(groupId, description, amount, paidBy);
  const expenseId = result.lastInsertRowid as number;

  return {
    id: expenseId,
    group_id: groupId,
    description,
    amount,
    paid_by: paidBy,
    created_at: new Date().toISOString()
  };
}

/**
 * Create expense splits for users
 */
export function createExpenseSplits(
  expenseId: number,
  splits: { userId: number; amount: number }[]
): void {
  const stmt = db.prepare(`
    INSERT INTO expense_splits (expense_id, user_id, amount)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((splits) => {
    for (const split of splits) {
      stmt.run(expenseId, split.userId, split.amount);
    }
  });

  insertMany(splits);
}

/**
 * Get expense by ID with full details
 */
export function getExpenseById(expenseId: number): ExpenseWithDetails | null {
  const expenseStmt = db.prepare(`
    SELECT
      e.*,
      u.name as paid_by_name,
      u.email as paid_by_email
    FROM expenses e
    JOIN users u ON e.paid_by = u.id
    WHERE e.id = ?
  `);

  const expense = expenseStmt.get(expenseId) as any;

  if (!expense) {
    return null;
  }

  const splitsStmt = db.prepare(`
    SELECT
      es.user_id,
      u.name as user_name,
      u.email as user_email,
      es.amount
    FROM expense_splits es
    JOIN users u ON es.user_id = u.id
    WHERE es.expense_id = ?
  `);

  const splits = splitsStmt.all(expenseId);

  return {
    id: expense.id,
    group_id: expense.group_id,
    description: expense.description,
    amount: expense.amount,
    paid_by: expense.paid_by,
    created_at: expense.created_at,
    paid_by_name: expense.paid_by_name,
    paid_by_email: expense.paid_by_email,
    splits
  };
}

/**
 * Get all expenses for a group with details
 */
export function getExpensesByGroupId(groupId: number): ExpenseWithDetails[] {
  const expenseStmt = db.prepare(`
    SELECT
      e.*,
      u.name as paid_by_name,
      u.email as paid_by_email
    FROM expenses e
    JOIN users u ON e.paid_by = u.id
    WHERE e.group_id = ?
    ORDER BY e.created_at DESC
  `);

  const expenses = expenseStmt.all(groupId) as any[];

  return expenses.map((expense) => {
    const splitsStmt = db.prepare(`
      SELECT
        es.user_id,
        u.name as user_name,
        u.email as user_email,
        es.amount
      FROM expense_splits es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);

    const splits = splitsStmt.all(expense.id);

    return {
      id: expense.id,
      group_id: expense.group_id,
      description: expense.description,
      amount: expense.amount,
      paid_by: expense.paid_by,
      created_at: expense.created_at,
      paid_by_name: expense.paid_by_name,
      paid_by_email: expense.paid_by_email,
      splits
    };
  });
}

/**
 * Get all group members for a group
 */
export function getGroupMembers(groupId: number): Array<{ id: number; name: string; email: string }> {
  const stmt = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.email
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
  `);

  return stmt.all(groupId) as Array<{ id: number; name: string; email: string }>;
}

/**
 * Delete an expense (cascades to expense_splits)
 */
export function deleteExpense(expenseId: number): boolean {
  const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
  const result = stmt.run(expenseId);
  return result.changes > 0;
}

/**
 * Update debt records after adding an expense
 */
export function updateDebts(
  groupId: number,
  paidBy: number,
  splits: { userId: number; amount: number }[]
): void {
  const insertStmt = db.prepare(`
    INSERT INTO debts (group_id, from_user_id, to_user_id, amount)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(group_id, from_user_id, to_user_id)
    DO UPDATE SET amount = amount + excluded.amount
  `);

  const updateMany = db.transaction((splits) => {
    for (const split of splits) {
      if (split.userId !== paidBy) {
        insertStmt.run(groupId, split.userId, paidBy, split.amount);
      }
    }
  });

  updateMany(splits);
}

/**
 * Get current balances for a user in a group
 */
export function getUserBalancesInGroup(
  groupId: number,
  userId: number
): { owes: number; owed: number; net: number } {
  const owesStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total_owes
    FROM debts
    WHERE group_id = ? AND from_user_id = ? AND settled = 0
  `);

  const owedStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total_owed
    FROM debts
    WHERE group_id = ? AND to_user_id = ? AND settled = 0
  `);

  const owesResult = owesStmt.get(groupId, userId) as any;
  const owedResult = owedStmt.get(groupId, userId) as any;

  const owes = owesResult.total_owes || 0;
  const owed = owedResult.total_owed || 0;
  const net = owed - owes;

  return { owes, owed, net };
}
