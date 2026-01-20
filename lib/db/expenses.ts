import { getDb, Expense, ExpenseSplit } from './schema';

export type CreateExpenseInput = {
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'custom';
  splits: Array<{
    user_id: string;
    amount: number;
  }>;
};

export type ExpenseWithDetails = Expense & {
  paid_by_name: string;
  paid_by_email: string;
  splits: Array<{
    user_id: string;
    user_name: string;
    user_email: string;
    amount: number;
  }>;
};

/**
 * Generate a unique ID for database records
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a new expense with splits
 */
export function createExpense(input: CreateExpenseInput): Expense {
  const db = getDb();

  // Validate total splits match the expense amount
  const totalSplits = input.splits.reduce((sum, split) => sum + split.amount, 0);
  if (Math.abs(totalSplits - input.amount) > 0.01) {
    throw new Error('Total split amounts must equal the expense amount');
  }

  // Validate at least one split exists
  if (input.splits.length === 0) {
    throw new Error('At least one split is required');
  }

  // Start transaction
  const createExpense = db.transaction(() => {
    // Create the expense
    const expenseId = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO expenses (id, group_id, description, amount, paid_by, split_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(expenseId, input.group_id, input.description, input.amount, input.paid_by, input.split_type, now, now);

    // Create the splits
    const insertSplit = db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount)
      VALUES (?, ?, ?, ?)
    `);

    for (const split of input.splits) {
      const splitId = generateId();
      insertSplit.run(splitId, expenseId, split.user_id, split.amount);
    }

    // Return the created expense
    const expense = db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `).get(expenseId) as Expense;

    return expense;
  });

  return createExpense();
}

/**
 * Get all expenses for a group with user details
 */
export function getExpensesByGroup(
  groupId: string,
  options?: { limit?: number; offset?: number }
): ExpenseWithDetails[] {
  const db = getDb();

  let query = `
    SELECT
      e.*,
      u.name as paid_by_name,
      u.email as paid_by_email
    FROM expenses e
    JOIN users u ON e.paid_by = u.id
    WHERE e.group_id = ?
    ORDER BY e.created_at DESC
  `;

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
    if (options.offset) {
      query += ` OFFSET ${options.offset}`;
    }
  }

  const expenses = db.prepare(query).all(groupId) as Array<Expense & {
    paid_by_name: string;
    paid_by_email: string;
  }>;

  // Get splits for each expense
  const expensesWithSplits: ExpenseWithDetails[] = expenses.map(expense => {
    const splits = db.prepare(`
      SELECT
        es.user_id,
        u.name as user_name,
        u.email as user_email,
        es.amount
      FROM expense_splits es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `).all(expense.id) as Array<{
      user_id: string;
      user_name: string;
      user_email: string;
      amount: number;
    }>;

    return {
      ...expense,
      splits
    };
  });

  return expensesWithSplits;
}

/**
 * Get a single expense by ID with full details
 */
export function getExpenseById(expenseId: string): ExpenseWithDetails | null {
  const db = getDb();

  const expense = db.prepare(`
    SELECT
      e.*,
      u.name as paid_by_name,
      u.email as paid_by_email
    FROM expenses e
    JOIN users u ON e.paid_by = u.id
    WHERE e.id = ?
  `).get(expenseId) as (Expense & { paid_by_name: string; paid_by_email: string }) | undefined;

  if (!expense) {
    return null;
  }

  const splits = db.prepare(`
    SELECT
      es.user_id,
      u.name as user_name,
      u.email as user_email,
      es.amount
    FROM expense_splits es
    JOIN users u ON es.user_id = u.id
    WHERE es.expense_id = ?
  `).all(expense.id) as Array<{
    user_id: string;
    user_name: string;
    user_email: string;
    amount: number;
  }>;

  return {
    ...expense,
    splits
  };
}

/**
 * Update an existing expense
 */
export function updateExpense(
  expenseId: string,
  updates: Partial<Pick<CreateExpenseInput, 'description' | 'amount' | 'splits'>>
): Expense | null {
  const db = getDb();

  // Check if expense exists
  const existingExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(expenseId) as Expense | undefined;
  if (!existingExpense) {
    return null;
  }

  const updateExpense = db.transaction(() => {
    // Update expense fields
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updates.description);
    }

    if (updates.amount !== undefined) {
      updateFields.push('amount = ?');
      values.push(updates.amount);
    }

    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());

    if (updateFields.length > 0) {
      values.push(expenseId);
      db.prepare(`
        UPDATE expenses
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).run(...values);
    }

    // Update splits if provided
    if (updates.splits) {
      const newAmount = updates.amount ?? existingExpense.amount;
      const totalSplits = updates.splits.reduce((sum, split) => sum + split.amount, 0);

      if (Math.abs(totalSplits - newAmount) > 0.01) {
        throw new Error('Total split amounts must equal the expense amount');
      }

      // Delete existing splits
      db.prepare('DELETE FROM expense_splits WHERE expense_id = ?').run(expenseId);

      // Insert new splits
      const insertSplit = db.prepare(`
        INSERT INTO expense_splits (id, expense_id, user_id, amount)
        VALUES (?, ?, ?, ?)
      `);

      for (const split of updates.splits) {
        const splitId = generateId();
        insertSplit.run(splitId, expenseId, split.user_id, split.amount);
      }
    }

    // Return updated expense
    return db.prepare('SELECT * FROM expenses WHERE id = ?').get(expenseId) as Expense;
  });

  return updateExpense();
}

/**
 * Delete an expense
 */
export function deleteExpense(expenseId: string): boolean {
  const db = getDb();

  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(expenseId);
  return result.changes > 0;
}

/**
 * Calculate equal splits for an expense among group members
 */
export function calculateEqualSplits(
  amount: number,
  userIds: string[],
  excludeUserIds: string[] = []
): Array<{ user_id: string; amount: number }> {
  const participatingUsers = userIds.filter(id => !excludeUserIds.includes(id));

  if (participatingUsers.length === 0) {
    throw new Error('No users to split the expense among');
  }

  const shareAmount = Math.round((amount / participatingUsers.length) * 100) / 100;
  let totalAssigned = 0;

  const splits = participatingUsers.map((user_id, index) => {
    // For the last user, assign the remaining amount to handle rounding errors
    const isLast = index === participatingUsers.length - 1;
    const userAmount = isLast ? Math.round((amount - totalAssigned) * 100) / 100 : shareAmount;
    totalAssigned += userAmount;

    return { user_id, amount: userAmount };
  });

  return splits;
}

/**
 * Get total expenses for a group
 */
export function getGroupTotalExpenses(groupId: string): number {
  const db = getDb();

  const result = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE group_id = ?
  `).get(groupId) as { total: number };

  return result.total;
}

/**
 * Get expenses paid by a user in a group
 */
export function getExpensesPaidByUser(groupId: string, userId: string): number {
  const db = getDb();

  const result = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE group_id = ? AND paid_by = ?
  `).get(groupId, userId) as { total: number };

  return result.total;
}

/**
 * Get share of expenses for a user in a group
 */
export function getUserExpenseShare(groupId: string, userId: string): number {
  const db = getDb();

  const result = db.prepare(`
    SELECT COALESCE(SUM(es.amount), 0) as total
    FROM expense_splits es
    JOIN expenses e ON es.expense_id = e.id
    WHERE e.group_id = ? AND es.user_id = ?
  `).get(groupId, userId) as { total: number };

  return result.total;
}
