import Database from 'better-sqlite3';
import { Expense, ExpenseSplit, Settlement, Balance } from './schema';

export class ExpenseRepository {
  constructor(private db: Database.Database) {}

  // Create a new expense
  createExpense(expense: Omit<Expense, 'id' | 'created_at'>, splits: Omit<ExpenseSplit, 'id'>[]): Expense {
    const id = this.generateId();
    const created_at = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO expenses (id, group_id, description, amount, paid_by, category, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, expense.group_id, expense.description, expense.amount, expense.paid_by, expense.category || null, expense.date, created_at);

    // Create expense splits
    const splitStmt = this.db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const split of splits) {
      const splitId = this.generateId();
      splitStmt.run(splitId, id, split.user_id, split.amount, split.percentage);
    }

    return { ...expense, id, created_at };
  }

  // Get expense by ID
  getExpenseById(id: string): Expense | undefined {
    const stmt = this.db.prepare('SELECT * FROM expenses WHERE id = ?');
    return stmt.get(id) as Expense | undefined;
  }

  // Get all expenses for a group
  getExpensesByGroupId(groupId: string): Expense[] {
    const stmt = this.db.prepare('SELECT * FROM expenses WHERE group_id = ? ORDER BY date DESC, created_at DESC');
    return stmt.all(groupId) as Expense[];
  }

  // Get expense splits for an expense
  getExpenseSplits(expenseId: string): ExpenseSplit[] {
    const stmt = this.db.prepare('SELECT * FROM expense_splits WHERE expense_id = ?');
    return stmt.all(expenseId) as ExpenseSplit[];
  }

  // Get expense with splits
  getExpenseWithSplits(expenseId: string): { expense: Expense; splits: ExpenseSplit[] } | undefined {
    const expense = this.getExpenseById(expenseId);
    if (!expense) return undefined;

    const splits = this.getExpenseSplits(expenseId);
    return { expense, splits };
  }

  // Update expense
  updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'created_at'>>): Expense | undefined {
    const existing = this.getExpenseById(id);
    if (!existing) return undefined;

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
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.date !== undefined) {
      fields.push('date = ?');
      values.push(updates.date);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getExpenseById(id);
  }

  // Update expense splits
  updateExpenseSplits(expenseId: string, splits: Omit<ExpenseSplit, 'id' | 'expense_id'>[]): void {
    // Delete existing splits
    const deleteStmt = this.db.prepare('DELETE FROM expense_splits WHERE expense_id = ?');
    deleteStmt.run(expenseId);

    // Insert new splits
    const insertStmt = this.db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const split of splits) {
      const splitId = this.generateId();
      insertStmt.run(splitId, expenseId, split.user_id, split.amount, split.percentage);
    }
  }

  // Delete expense
  deleteExpense(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM expenses WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Create settlement
  createSettlement(settlement: Omit<Settlement, 'id' | 'created_at'>): Settlement {
    const id = this.generateId();
    const created_at = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, status, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, settlement.group_id, settlement.from_user_id, settlement.to_user_id, settlement.amount, settlement.status, created_at, null);

    return { ...settlement, id, created_at };
  }

  // Get settlements for a group
  getSettlementsByGroupId(groupId: string): Settlement[] {
    const stmt = this.db.prepare(`
      SELECT * FROM settlements
      WHERE group_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(groupId) as Settlement[];
  }

  // Get pending settlements for a user
  getPendingSettlements(userId: string): Settlement[] {
    const stmt = this.db.prepare(`
      SELECT * FROM settlements
      WHERE status = 'pending'
      AND (from_user_id = ? OR to_user_id = ?)
      ORDER BY created_at DESC
    `);
    return stmt.all(userId, userId) as Settlement[];
  }

  // Update settlement status
  updateSettlementStatus(id: string, status: 'pending' | 'completed'): Settlement | undefined {
    const completed_at = status === 'completed' ? Date.now() : null;
    const stmt = this.db.prepare('UPDATE settlements SET status = ?, completed_at = ? WHERE id = ?');
    stmt.run(status, completed_at, id);
    return this.getSettlementById(id);
  }

  // Get settlement by ID
  getSettlementById(id: string): Settlement | undefined {
    const stmt = this.db.prepare('SELECT * FROM settlements WHERE id = ?');
    return stmt.get(id) as Settlement | undefined;
  }

  // Delete settlement
  deleteSettlement(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM settlements WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Calculate balances for a group
  calculateGroupBalances(groupId: string): Balance[] {
    const balancesStmt = this.db.prepare(`
      WITH user_totals AS (
        SELECT
          user_id,
          SUM(CASE WHEN paid_by = user_id THEN amount ELSE 0 END) as paid,
          SUM(CASE WHEN es.user_id = user_id THEN es.amount ELSE 0 END) as owes
        FROM expenses e
        LEFT JOIN expense_splits es ON e.id = es.expense_id
        WHERE e.group_id = ?
        GROUP BY user_id
      ),
      settlements_balance AS (
        SELECT
          from_user_id as user_id,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as to_pay
        FROM settlements
        WHERE group_id = ? AND status = 'pending'
        GROUP BY from_user_id
      ),
      settlements_receive AS (
        SELECT
          to_user_id as user_id,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as to_receive
        FROM settlements
        WHERE group_id = ? AND status = 'pending'
        GROUP BY to_user_id
      )
      SELECT
        COALESCE(ut.user_id, sr.user_id, sb.user_id) as user_id,
        ? as group_id,
        COALESCE((ut.paid - ut.owes), 0) + COALESCE(sr.to_receive, 0) - COALESCE(sb.to_pay, 0) as balance,
        COALESCE(sb.to_pay, 0) + COALESCE(ut.owes, 0) as total_owing,
        COALESCE(sr.to_receive, 0) + COALESCE(ut.paid, 0) as total_owed
      FROM user_totals ut
      FULL OUTER JOIN settlements_receive sr ON ut.user_id = sr.user_id
      FULL OUTER JOIN settlements_balance sb ON ut.user_id = sb.user_id
    `);

    return balancesStmt.all(groupId, groupId, groupId, groupId) as Balance[];
  }

  // Get user balance in a group
  getUserBalance(groupId: string, userId: string): Balance | undefined {
    const balances = this.calculateGroupBalances(groupId);
    return balances.find(b => b.user_id === userId);
  }

  // Calculate suggested settlements for a group
  calculateSuggestedSettlements(groupId: string): Array<{ from: string; to: string; amount: number }> {
    const balances = this.calculateGroupBalances(groupId);

    const debtors: Array<{ userId: string; amount: number }> = [];
    const creditors: Array<{ userId: string; amount: number }> = [];

    for (const balance of balances) {
      if (balance.balance < -0.01) {
        debtors.push({ userId: balance.user_id, amount: -balance.balance });
      } else if (balance.balance > 0.01) {
        creditors.push({ userId: balance.user_id, amount: balance.balance });
      }
    }

    const settlements: Array<{ from: string; to: string; amount: number }> = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: Math.round(amount * 100) / 100
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return settlements;
  }

  // Get expense summary for a group
  getGroupExpenseSummary(groupId: string): {
    total_expenses: number;
    expense_count: number;
    category_breakdown: Array<{ category: string; amount: number; count: number }>;
  } {
    const totalStmt = this.db.prepare(`
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE group_id = ?
    `);

    const categoryStmt = this.db.prepare(`
      SELECT
        COALESCE(category, 'Uncategorized') as category,
        SUM(amount) as amount,
        COUNT(*) as count
      FROM expenses
      WHERE group_id = ?
      GROUP BY category
      ORDER BY amount DESC
    `);

    const totalResult = totalStmt.get(groupId) as { count: number; total: number };
    const categoryBreakdown = categoryStmt.all(groupId) as Array<{ category: string; amount: number; count: number }>;

    return {
      total_expenses: totalResult.total,
      expense_count: totalResult.count,
      category_breakdown: categoryBreakdown
    };
  }

  // Get recent expenses for a group
  getRecentExpenses(groupId: string, limit: number = 10): Expense[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses
      WHERE group_id = ?
      ORDER BY date DESC, created_at DESC
      LIMIT ?
    `);
    return stmt.all(groupId, limit) as Expense[];
  }

  // Search expenses
  searchExpenses(groupId: string, query: string): Expense[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses
      WHERE group_id = ?
      AND (description LIKE ? OR category LIKE ?)
      ORDER BY date DESC
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(groupId, searchTerm, searchTerm) as Expense[];
  }

  // Helper: Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
