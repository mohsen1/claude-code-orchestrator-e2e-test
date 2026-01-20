import Database from 'better-sqlite3';
import { createExpense } from './expenses';
import { addToBalance, subtractFromBalance, upsertBalance } from './balances';

export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
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
 * Execute a function within a database transaction
 * Automatically commits on success or rolls back on failure
 */
export function executeInTransaction<T>(
  db: Database.Database,
  fn: () => T
): TransactionResult<T> {
  const transaction = db.transaction(() => {
    try {
      const result = fn();
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw to trigger rollback
      }
      throw new Error('Transaction failed');
    }
  });

  try {
    return transaction();
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown transaction error' };
  }
}

/**
 * Create expense and update balances in a single transaction
 */
export function createExpenseWithBalances(
  db: Database.Database,
  input: {
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
): TransactionResult<{
  expenseId: string;
  balancesUpdated: boolean;
}> {
  return executeInTransaction(db, () => {
    // Create the expense
    const expense = createExpense(db, input);

    // Update balances based on splits
    for (const split of input.splits) {
      // Skip if the split is for the payer (they don't owe themselves)
      if (split.user_id === input.paid_by) {
        continue;
      }

      const splitAmount = split.amount || (input.amount * (split.percentage ? parseFloat(split.percentage) : 0)) / 100;

      if (splitAmount > 0) {
        // Add to balance: split user owes payer
        addToBalance(
          db,
          input.group_id,
          split.user_id,
          input.paid_by,
          splitAmount,
          input.currency
        );
      }
    }

    return {
      expenseId: expense.id,
      balancesUpdated: true,
    };
  });
}

/**
 * Delete expense and update balances in a single transaction
 */
export function deleteExpenseWithBalances(
  db: Database.Database,
  expenseId: string
): TransactionResult<{
  expenseDeleted: boolean;
  balancesUpdated: boolean;
}> {
  return executeInTransaction(db, () => {
    // Get expense details before deleting
    const expenseStmt = db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `);
    const expense = expenseStmt.get(expenseId) as {
      id: string;
      group_id: string;
      paid_by: string;
      amount: number;
      currency: string;
    } | undefined;

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Get splits for the expense
    const splitsStmt = db.prepare(`
      SELECT * FROM expense_splits WHERE expense_id = ?
    `);
    const splits = splitsStmt.all(expenseId) as Array<{
      user_id: string;
      amount: number;
    }>;

    // Update balances - reverse the splits
    for (const split of splits) {
      if (split.user_id !== expense.paid_by) {
        subtractFromBalance(
          db,
          expense.group_id,
          split.user_id,
          expense.paid_by,
          split.amount,
          expense.currency
        );
      }
    }

    // Delete the expense (splits are deleted via cascade)
    const deleteStmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    deleteStmt.run(expenseId);

    return {
      expenseDeleted: true,
      balancesUpdated: true,
    };
  });
}

/**
 * Update expense and balances in a single transaction
 */
export function updateExpenseWithBalances(
  db: Database.Database,
  expenseId: string,
  updates: {
    description?: string;
    amount?: number;
    currency?: string;
    paid_by?: string;
    expense_date?: string;
    category?: string;
    notes?: string;
    splits?: Array<{
      user_id: string;
      amount?: number;
      percentage?: string;
    }>;
  }
): TransactionResult<{
  expenseUpdated: boolean;
  balancesUpdated: boolean;
}> {
  return executeInTransaction(db, () => {
    // Get current expense and splits
    const currentExpenseStmt = db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `);
    const currentExpense = currentExpenseStmt.get(expenseId) as {
      id: string;
      group_id: string;
      paid_by: string;
      amount: number;
      currency: string;
    } | undefined;

    if (!currentExpense) {
      throw new Error('Expense not found');
    }

    const currentSplitsStmt = db.prepare(`
      SELECT * FROM expense_splits WHERE expense_id = ?
    `);
    const currentSplits = currentSplitsStmt.all(expenseId) as Array<{
      user_id: string;
      amount: number;
    }>;

    // Reverse old balances
    for (const split of currentSplits) {
      if (split.user_id !== currentExpense.paid_by) {
        subtractFromBalance(
          db,
          currentExpense.group_id,
          split.user_id,
          currentExpense.paid_by,
          split.amount,
          currentExpense.currency
        );
      }
    }

    // Update expense
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    if (updates.amount !== undefined) {
      updateFields.push('amount = ?');
      updateValues.push(updates.amount);
    }
    if (updates.currency !== undefined) {
      updateFields.push('currency = ?');
      updateValues.push(updates.currency);
    }
    if (updates.paid_by !== undefined) {
      updateFields.push('paid_by = ?');
      updateValues.push(updates.paid_by);
    }
    if (updates.expense_date !== undefined) {
      updateFields.push('expense_date = ?');
      updateValues.push(updates.expense_date);
    }
    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(updates.category);
    }
    if (updates.notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(updates.notes);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(expenseId);

      const updateStmt = db.prepare(`
        UPDATE expenses
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `);
      updateStmt.run(...updateValues);
    }

    // Delete old splits
    const deleteSplitsStmt = db.prepare('DELETE FROM expense_splits WHERE expense_id = ?');
    deleteSplitsStmt.run(expenseId);

    // Create new splits and update balances
    const newSplits = updates.splits || currentSplits.map(s => ({ user_id: s.user_id, amount: s.amount }));
    const newAmount = updates.amount || currentExpense.amount;
    const newCurrency = updates.currency || currentExpense.currency;
    const newPaidBy = updates.paid_by || currentExpense.paid_by;

    for (const split of newSplits) {
      const splitAmount = split.amount || (newAmount * (split.percentage ? parseFloat(split.percentage) : 0)) / 100;

      // Create new split
      const createSplitStmt = db.prepare(`
        INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
        VALUES (?, ?, ?, ?, ?)
      `);
      createSplitStmt.run(
        crypto.randomUUID(),
        expenseId,
        split.user_id,
        splitAmount,
        split.percentage || null
      );

      // Update new balances
      if (split.user_id !== newPaidBy && splitAmount > 0) {
        addToBalance(
          db,
          currentExpense.group_id,
          split.user_id,
          newPaidBy,
          splitAmount,
          newCurrency
        );
      }
    }

    return {
      expenseUpdated: true,
      balancesUpdated: true,
    };
  });
}

/**
 * Settle up balances between users in a group
 */
export function settleUpBalance(
  db: Database.Database,
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number,
  currency?: string
): TransactionResult<{
  balanceCleared: boolean;
}> {
  return executeInTransaction(db, () => {
    // Subtract from the balance
    subtractFromBalance(
      db,
      groupId,
      fromUserId,
      toUserId,
      amount,
      currency
    );

    // Create a settlement expense (optional - creates a record)
    const settlementStmt = db.prepare(`
      INSERT INTO expenses (id, group_id, description, amount, currency, paid_by, expense_date, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const settlementId = crypto.randomUUID();

    settlementStmt.run(
      settlementId,
      groupId,
      `Settlement: ${fromUserId} paid ${toUserId}`,
      amount,
      currency || 'USD',
      fromUserId,
      now,
      'settlement',
      now,
      now
    );

    return {
      balanceCleared: true,
    };
  });
}

/**
 * Bulk settle all balances for a user in a group
 * Optimizes multiple payments to minimize transactions
 */
export function settleUserBalances(
  db: Database.Database,
  groupId: string,
  userId: string
): TransactionResult<{
  settlementsCreated: number;
}> {
  return executeInTransaction(db, () => {
    // Get all balances for this user
    const balancesStmt = db.prepare(`
      SELECT * FROM balances
      WHERE group_id = ? AND (from_user_id = ? OR to_user_id = ?)
      ORDER BY amount DESC
    `);

    const balances = balancesStmt.all(groupId, userId, userId) as Array<{
      id: string;
      from_user_id: string;
      to_user_id: string;
      amount: number;
      currency: string;
    }>;

    let settlementsCreated = 0;

    for (const balance of balances) {
      if (balance.amount > 0) {
        if (balance.from_user_id === userId) {
          // User owes money, settle up
          settleUpBalance(
            db,
            groupId,
            userId,
            balance.to_user_id,
            balance.amount,
            balance.currency
          );
          settlementsCreated++;
        }
      }
    }

    return {
      settlementsCreated,
    };
  });
}

/**
 * Validate balances in a group by recalculating from expenses
 * Returns any discrepancies found
 */
export function validateGroupBalances(
  db: Database.Database,
  groupId: string
): TransactionResult<{
  isValid: boolean;
  discrepancies: Array<{
    from_user_id: string;
    to_user_id: string;
    expected: number;
    actual: number;
    difference: number;
  }>;
}> {
  return executeInTransaction(db, () => {
    // Get current balances
    const currentBalancesStmt = db.prepare(`
      SELECT * FROM balances WHERE group_id = ?
    `);
    const currentBalances = currentBalancesStmt.all(groupId) as Array<{
      from_user_id: string;
      to_user_id: string;
      amount: number;
      currency: string;
    }>;

    // Calculate expected balances from expenses
    const expensesStmt = db.prepare(`
      SELECT e.paid_by, es.user_id as split_user_id, es.amount as split_amount, e.currency
      FROM expenses e
      JOIN expense_splits es ON e.id = es.expense_id
      WHERE e.group_id = ? AND e.paid_by != es.user_id
    `);

    const expenses = expensesStmt.all(groupId) as Array<{
      paid_by: string;
      split_user_id: string;
      split_amount: number;
      currency: string;
    }>;

    const expectedBalances = new Map<string, number>();

    for (const expense of expenses) {
      const key = `${expense.split_user_id}->${expense.paid_by}`;
      expectedBalances.set(key, (expectedBalances.get(key) || 0) + expense.split_amount);
    }

    const discrepancies: Array<{
      from_user_id: string;
      to_user_id: string;
      expected: number;
      actual: number;
      difference: number;
    }> = [];

    for (const [key, expected] of expectedBalances.entries()) {
      const [from_user_id, to_user_id] = key.split('->');

      const current = currentBalances.find(
        b => b.from_user_id === from_user_id && b.to_user_id === to_user_id
      );

      const actual = current?.amount || 0;
      const difference = Math.abs(expected - actual);

      if (difference > 0.01) { // Allow small floating point differences
        discrepancies.push({
          from_user_id,
          to_user_id,
          expected,
          actual,
          difference,
        });
      }
    }

    return {
      isValid: discrepancies.length === 0,
      discrepancies,
    };
  });
}
