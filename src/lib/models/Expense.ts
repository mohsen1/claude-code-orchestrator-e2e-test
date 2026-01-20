import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  created_at: string;
}

export interface CreateExpenseInput {
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  paid_by?: string;
}

export class ExpenseModel {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
    this.initializeTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        paid_by TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE RESTRICT
      )
    `;

    this.db.exec(createTableQuery);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_expenses_group_id
      ON expenses(group_id);

      CREATE INDEX IF NOT EXISTS idx_expenses_paid_by
      ON expenses(paid_by);

      CREATE INDEX IF NOT EXISTS idx_expenses_created_at
      ON expenses(created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_expenses_group_created
      ON expenses(group_id, created_at DESC);
    `);
  }

  create(input: CreateExpenseInput): Expense {
    const id = uuidv4();
    const created_at = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO expenses (id, group_id, description, amount, paid_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.group_id, input.description, input.amount, input.paid_by, created_at);

    return {
      id,
      group_id: input.group_id,
      description: input.description,
      amount: input.amount,
      paid_by: input.paid_by,
      created_at
    };
  }

  findById(id: string): Expense | null {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row || null;
  }

  findByGroup(groupId: string): Expense[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC
    `);

    return stmt.all(groupId) as Expense[];
  }

  findByPaidBy(userId: string): Expense[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses WHERE paid_by = ? ORDER BY created_at DESC
    `);

    return stmt.all(userId) as Expense[];
  }

  findRecent(groupId: string, limit: number = 10): Expense[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses
      WHERE group_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(groupId, limit) as Expense[];
  }

  update(id: string, input: UpdateExpenseInput): Expense | null {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }

    if (input.amount !== undefined) {
      updates.push('amount = ?');
      values.push(input.amount);
    }

    if (input.paid_by !== undefined) {
      updates.push('paid_by = ?');
      values.push(input.paid_by);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE expenses
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM expenses WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteByGroup(groupId: string): number {
    const stmt = this.db.prepare(`
      DELETE FROM expenses WHERE group_id = ?
    `);

    const result = stmt.run(groupId);
    return result.changes;
  }

  getTotalByGroup(groupId: string): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ?
    `);

    const result = stmt.get(groupId) as { total: number };
    return result.total;
  }

  getTotalByUser(userId: string): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = ?
    `);

    const result = stmt.get(userId) as { total: number };
    return result.total;
  }

  getTotalByUserInGroup(groupId: string, userId: string): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE group_id = ? AND paid_by = ?
    `);

    const result = stmt.get(groupId, userId) as { total: number };
    return result.total;
  }

  getAll(): Expense[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses ORDER BY created_at DESC
    `);

    return stmt.all() as Expense[];
  }

  getExpensesByDateRange(groupId: string, startDate: string, endDate: string): Expense[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expenses
      WHERE group_id = ? AND created_at >= ? AND created_at <= ?
      ORDER BY created_at DESC
    `);

    return stmt.all(groupId, startDate, endDate) as Expense[];
  }
}
