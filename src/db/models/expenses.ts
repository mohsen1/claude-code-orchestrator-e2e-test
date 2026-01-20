import Database from 'better-sqlite3';
import { Expense, ExpenseSplit, User } from '../schema';

/**
 * Expense with splits
 */
export interface ExpenseWithSplits extends Expense {
  splits: ExpenseSplitWithUser[];
  paid_by_user?: User;
}

/**
 * Expense split with user details
 */
export interface ExpenseSplitWithUser extends ExpenseSplit {
  user: User;
}

/**
 * Balance information for a user in a group
 */
export interface UserBalance {
  user_id: string;
  user: User;
  total_paid: number;
  total_owed: number;
  balance: number;
}

/**
 * Expense model operations
 */
export class ExpenseModel {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Find expense by ID
   */
  findById(id: string): ExpenseWithSplits | null {
    const expense = this.db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id) as Expense | undefined;

    if (!expense) {
      return null;
    }

    const splits = this.getSplitsForExpense(id);
    const paidByUser = this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(expense.paid_by) as User | undefined;

    return {
      ...expense,
      splits,
      paid_by_user: paidByUser,
    };
  }

  /**
   * Create expense with equal splits among group members
   */
  create(
    expense: Omit<Expense, 'created_at' | 'updated_at'>,
    splitAmongUserIds: string[]
  ): ExpenseWithSplits {
    const now = Date.now();
    const newExpense: Expense = {
      ...expense,
      created_at: now,
      updated_at: now,
    };

    // Calculate split amount
    const splitAmount = expense.amount / splitAmongUserIds.length;

    this.db.transaction(() => {
      // Insert expense
      this.db
        .prepare(
          `
          INSERT INTO expenses (id, group_id, description, amount, paid_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        )
        .run(
          newExpense.id,
          newExpense.group_id,
          newExpense.description,
          newExpense.amount,
          newExpense.paid_by,
          newExpense.created_at,
          newExpense.updated_at
        );

      // Create splits
      for (const userId of splitAmongUserIds) {
        const split: ExpenseSplit = {
          id: `${newExpense.id}-${userId}-${Date.now()}-${Math.random()}`,
          expense_id: newExpense.id,
          user_id: userId,
          amount: splitAmount,
          created_at: now,
        };

        this.db
          .prepare(
            `
            INSERT INTO expense_splits (id, expense_id, user_id, amount, created_at)
            VALUES (?, ?, ?, ?, ?)
          `
          )
          .run(split.id, split.expense_id, split.user_id, split.amount, split.created_at);
      }
    })();

    return this.findById(newExpense.id)!;
  }

  /**
   * Update expense
   */
  update(
    id: string,
    updates: Partial<Omit<Expense, 'id' | 'group_id' | 'created_at' | 'updated_at'>>,
    splitAmongUserIds?: string[]
  ): ExpenseWithSplits | null {
    const existing = this.findById(id);

    if (!existing) {
      return null;
    }

    const updatedExpense: Expense = {
      ...existing,
      ...updates,
      updated_at: Date.now(),
    };

    this.db.transaction(() => {
      // Update expense
      this.db
        .prepare(
          `
          UPDATE expenses
          SET description = ?, amount = ?, paid_by = ?, updated_at = ?
          WHERE id = ?
        `
        )
        .run(
          updatedExpense.description,
          updatedExpense.amount,
          updatedExpense.paid_by,
          updatedExpense.updated_at,
          updatedExpense.id
        );

      // Update splits if provided
      if (splitAmongUserIds) {
        // Delete existing splits
        this.db.prepare('DELETE FROM expense_splits WHERE expense_id = ?').run(id);

        // Create new splits
        const splitAmount = updatedExpense.amount / splitAmongUserIds.length;

        for (const userId of splitAmongUserIds) {
          const split: ExpenseSplit = {
            id: `${updatedExpense.id}-${userId}-${Date.now()}-${Math.random()}`,
            expense_id: updatedExpense.id,
            user_id: userId,
            amount: splitAmount,
            created_at: Date.now(),
          };

          this.db
            .prepare(
              `
              INSERT INTO expense_splits (id, expense_id, user_id, amount, created_at)
              VALUES (?, ?, ?, ?, ?)
            `
            )
            .run(split.id, split.expense_id, split.user_id, split.amount, split.created_at);
        }
      }
    })();

    return this.findById(id);
  }

  /**
   * Delete expense
   */
  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Get expenses for a group
   */
  getByGroupId(groupId: string): ExpenseWithSplits[] {
    const expenses = this.db
      .prepare(
        'SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC'
      )
      .all(groupId) as Expense[];

    return expenses.map(expense => {
      const splits = this.getSplitsForExpense(expense.id);
      const paidByUser = this.db
        .prepare('SELECT * FROM users WHERE id = ?')
        .get(expense.paid_by) as User | undefined;

      return {
        ...expense,
        splits,
        paid_by_user: paidByUser,
      };
    });
  }

  /**
   * Get expenses paid by user
   */
  getPaidByUserId(userId: string): Expense[] {
    return this.db
      .prepare('SELECT * FROM expenses WHERE paid_by = ? ORDER BY created_at DESC')
      .all(userId) as Expense[];
  }

  /**
   * Get splits for expense
   */
  getSplitsForExpense(expenseId: string): ExpenseSplitWithUser[] {
    const rows = this.db
      .prepare(
        `
        SELECT es.*, u.id as user_id, u.email, u.name, u.image, u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM expense_splits es
        INNER JOIN users u ON es.user_id = u.id
        WHERE es.expense_id = ?
      `
      )
      .all(expenseId) as any[];

    return rows.map(row => ({
      id: row.id,
      expense_id: row.expense_id,
      user_id: row.user_id,
      amount: row.amount,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        email: row.email,
        name: row.name,
        image: row.image,
        created_at: row.user_created_at,
        updated_at: row.user_updated_at,
      },
    }));
  }

  /**
   * Calculate balances for a group
   * Positive balance = owed money (others owe them)
   * Negative balance = owes money
   */
  calculateBalances(groupId: string): UserBalance[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          u.id as user_id,
          u.email,
          u.name,
          u.image,
          u.created_at as user_created_at,
          u.updated_at as user_updated_at,
          COALESCE(SUM(CASE WHEN e.paid_by = u.id THEN e.amount ELSE 0 END), 0) as total_paid,
          COALESCE(SUM(es.amount), 0) as total_owed
        FROM users u
        INNER JOIN group_members gm ON u.id = gm.user_id
        LEFT JOIN expenses e ON e.group_id = gm.group_id
        LEFT JOIN expense_splits es ON es.expense_id = e.id AND es.user_id = u.id
        WHERE gm.group_id = ?
        GROUP BY u.id
      `
      )
      .all(groupId) as any[];

    return rows.map(row => {
      const totalPaid = row.total_paid || 0;
      const totalOwed = row.total_owed || 0;
      const balance = totalPaid - totalOwed;

      return {
        user_id: row.user_id,
        user: {
          id: row.user_id,
          email: row.email,
          name: row.name,
          image: row.image,
          created_at: row.user_created_at,
          updated_at: row.user_updated_at,
        },
        total_paid: totalPaid,
        total_owed: totalOwed,
        balance: balance,
      };
    });
  }

  /**
   * Get total expenses for a group
   */
  getTotalForGroup(groupId: string): number {
    const row = this.db
      .prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ?')
      .get(groupId) as { total: number };
    return row.total;
  }

  /**
   Get recent expenses across all groups
   */
  getRecent(limit: number = 10): Expense[] {
    return this.db
      .prepare('SELECT * FROM expenses ORDER BY created_at DESC LIMIT ?')
      .all(limit) as Expense[];
  }
}

/**
 * Create expense model instance
 */
export function createExpenseModel(db: Database.Database): ExpenseModel {
  return new ExpenseModel(db);
}
