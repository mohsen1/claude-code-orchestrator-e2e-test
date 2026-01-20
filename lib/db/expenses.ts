import db, { Expense, ExpenseWithDetails, ExpenseSplit, User } from './schema';

// Helper function to generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create a new expense
export function createExpense(data: {
  group_id: string;
  description: string;
  amount: number;
  currency?: string;
  paid_by: string;
  category?: string;
  date?: string;
  split_with?: string[]; // Array of user IDs to split with
}): Expense {
  const expenseId = generateId();
  const now = new Date().toISOString();

  const expense: Expense = {
    id: expenseId,
    group_id: data.group_id,
    description: data.description,
    amount: data.amount,
    currency: data.currency || 'USD',
    paid_by: data.paid_by,
    category: data.category,
    date: data.date || now,
    created_at: now,
    updated_at: now,
  };

  const stmt = db.prepare(`
    INSERT INTO expenses (id, group_id, description, amount, currency, paid_by, category, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    expense.id,
    expense.group_id,
    expense.description,
    expense.amount,
    expense.currency,
    expense.paid_by,
    expense.category,
    expense.date,
    expense.created_at,
    expense.updated_at
  );

  // If splits are provided, create them
  if (data.split_with && data.split_with.length > 0) {
    const splitAmount = data.amount / data.split_with.length;

    const splitStmt = db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount)
      VALUES (?, ?, ?, ?)
    `);

    data.split_with.forEach(userId => {
      const splitId = generateId();
      splitStmt.run(splitId, expenseId, userId, splitAmount);
    });
  }

  return expense;
}

// Get expense by ID with details
export function getExpenseById(id: string): ExpenseWithDetails | null {
  const expenseStmt = db.prepare(`
    SELECT * FROM expenses WHERE id = ?
  `);

  const expense = expenseStmt.get(id) as Expense | undefined;

  if (!expense) {
    return null;
  }

  // Get payer information
  const payerStmt = db.prepare(`
    SELECT id, name, email FROM users WHERE id = ?
  `);
  const paidByUser = payerStmt.get(expense.paid_by) as User | undefined;

  // Get splits
  const splitsStmt = db.prepare(`
    SELECT es.*, u.id, u.name, u.email
    FROM expense_splits es
    LEFT JOIN users u ON es.user_id = u.id
    WHERE es.expense_id = ?
  `);
  const splits = splitsStmt.all(id) as (ExpenseSplit & User)[];

  return {
    ...expense,
    paid_by_user: paidByUser,
    splits,
  };
}

// Get all expenses for a group
export function getExpensesByGroupId(groupId: string): ExpenseWithDetails[] {
  const expensesStmt = db.prepare(`
    SELECT * FROM expenses WHERE group_id = ? ORDER BY date DESC
  `);

  const expenses = expensesStmt.all(groupId) as Expense[];

  return expenses.map(expense => {
    // Get payer information
    const payerStmt = db.prepare(`
      SELECT id, name, email FROM users WHERE id = ?
    `);
    const paidByUser = payerStmt.get(expense.paid_by) as User | undefined;

    // Get splits
    const splitsStmt = db.prepare(`
      SELECT es.*, u.id, u.name, u.email
      FROM expense_splits es
      LEFT JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);
    const splits = splitsStmt.all(expense.id) as (ExpenseSplit & User)[];

    return {
      ...expense,
      paid_by_user: paidByUser,
      splits,
    };
  });
}

// Get all expenses for a user (across all groups)
export function getExpensesByUserId(userId: string): ExpenseWithDetails[] {
  const expensesStmt = db.prepare(`
    SELECT * FROM expenses
    WHERE paid_by = ?
    OR id IN (SELECT expense_id FROM expense_splits WHERE user_id = ?)
    ORDER BY date DESC
  `);

  const expenses = expensesStmt.all(userId, userId) as Expense[];

  return expenses.map(expense => {
    // Get payer information
    const payerStmt = db.prepare(`
      SELECT id, name, email FROM users WHERE id = ?
    `);
    const paidByUser = payerStmt.get(expense.paid_by) as User | undefined;

    // Get splits
    const splitsStmt = db.prepare(`
      SELECT es.*, u.id, u.name, u.email
      FROM expense_splits es
      LEFT JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);
    const splits = splitsStmt.all(expense.id) as (ExpenseSplit & User)[];

    return {
      ...expense,
      paid_by_user: paidByUser,
      splits,
    };
  });
}

// Update expense
export function updateExpense(
  id: string,
  data: {
    description?: string;
    amount?: number;
    currency?: string;
    category?: string;
    date?: string;
  }
): Expense | null {
  const currentExpense = getExpenseById(id);

  if (!currentExpense) {
    return null;
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.amount !== undefined) {
    updates.push('amount = ?');
    values.push(data.amount);
  }
  if (data.currency !== undefined) {
    updates.push('currency = ?');
    values.push(data.currency);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category);
  }
  if (data.date !== undefined) {
    updates.push('date = ?');
    values.push(data.date);
  }

  if (updates.length === 0) {
    return currentExpense;
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const stmt = db.prepare(`
    UPDATE expenses
    SET ${updates.join(', ')}
    WHERE id = ?
  `);

  stmt.run(...values);

  // If amount changed, recalculate splits
  if (data.amount !== undefined && currentExpense.splits && currentExpense.splits.length > 0) {
    const splitAmount = data.amount / currentExpense.splits.length;

    const updateSplitStmt = db.prepare(`
      UPDATE expense_splits
      SET amount = ?
      WHERE expense_id = ?
    `);

    updateSplitStmt.run(splitAmount, id);
  }

  return getExpenseById(id);
}

// Delete expense
export function deleteExpense(id: string): boolean {
  const stmt = db.prepare(`
    DELETE FROM expenses WHERE id = ?
  `);

  const result = stmt.run(id);

  return result.changes > 0;
}

// Update expense splits
export function updateExpenseSplits(
  expenseId: string,
  userIds: string[]
): boolean {
  const expense = getExpenseById(expenseId);

  if (!expense) {
    return false;
  }

  // Delete existing splits
  const deleteStmt = db.prepare(`
    DELETE FROM expense_splits WHERE expense_id = ?
  `);
  deleteStmt.run(expenseId);

  // Create new splits
  if (userIds.length > 0) {
    const splitAmount = expense.amount / userIds.length;

    const splitStmt = db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount)
      VALUES (?, ?, ?, ?)
    `);

    userIds.forEach(userId => {
      const splitId = generateId();
      splitStmt.run(splitId, expenseId, userId, splitAmount);
    });
  }

  return true;
}

// Calculate balances for a group
export function calculateGroupBalances(groupId: string) {
  const expenses = getExpensesByGroupId(groupId);

  const balances: Record<string, number> = {};

  expenses.forEach(expense => {
    // The payer is owed money
    if (!balances[expense.paid_by]) {
      balances[expense.paid_by] = 0;
    }
    balances[expense.paid_by] += expense.amount;

    // Each person in the split owes money
    if (expense.splits) {
      expense.splits.forEach(split => {
        if (!balances[split.user_id]) {
          balances[split.user_id] = 0;
        }
        balances[split.user_id] -= split.amount;
      });
    }
  });

  return balances;
}

// Get user's total balance across all groups
export function getUserBalance(userId: string): number {
  const expenses = getExpensesByUserId(userId);

  let balance = 0;

  expenses.forEach(expense => {
    // If user paid, they're owed money
    if (expense.paid_by === userId) {
      balance += expense.amount;
    }

    // If user is in splits, they owe money
    if (expense.splits) {
      const userSplit = expense.splits.find(s => s.user_id === userId);
      if (userSplit) {
        balance -= userSplit.amount;
      }
    }
  });

  return balance;
}
