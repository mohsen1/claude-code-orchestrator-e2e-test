import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
}

export interface CreateExpenseSplitInput {
  expense_id: string;
  user_id: string;
  amount: number;
}

export interface UpdateExpenseSplitInput {
  amount?: number;
}

export class ExpenseSplitModel {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
    this.initializeTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS expense_splits (
        id TEXT PRIMARY KEY,
        expense_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount >= 0),
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(expense_id, user_id)
      )
    `;

    this.db.exec(createTableQuery);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id
      ON expense_splits(expense_id);

      CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id
      ON expense_splits(user_id);

      CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_user
      ON expense_splits(expense_id, user_id);

      CREATE INDEX IF NOT EXISTS idx_expense_splits_amount
      ON expense_splits(amount);
    `);
  }

  create(input: CreateExpenseSplitInput): ExpenseSplit {
    const id = uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, input.expense_id, input.user_id, input.amount);

    return {
      id,
      expense_id: input.expense_id,
      user_id: input.user_id,
      amount: input.amount
    };
  }

  createMany(inputs: CreateExpenseSplitInput[]): ExpenseSplit[] {
    const splits: ExpenseSplit[] = [];

    const stmt = this.db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((splitsToCreate: CreateExpenseSplitInput[]) => {
      const createdSplits: ExpenseSplit[] = [];

      for (const input of splitsToCreate) {
        const id = uuidv4();
        stmt.run(id, input.expense_id, input.user_id, input.amount);

        createdSplits.push({
          id,
          expense_id: input.expense_id,
          user_id: input.user_id,
          amount: input.amount
        });
      }

      return createdSplits;
    });

    return insertMany(inputs);
  }

  findById(id: string): ExpenseSplit | null {
    const stmt = this.db.prepare(`
      SELECT * FROM expense_splits WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row || null;
  }

  findByExpense(expenseId: string): ExpenseSplit[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expense_splits WHERE expense_id = ? ORDER BY amount DESC
    `);

    return stmt.all(expenseId) as ExpenseSplit[];
  }

  findByUser(userId: string): ExpenseSplit[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expense_splits WHERE user_id = ? ORDER BY amount DESC
    `);

    return stmt.all(userId) as ExpenseSplit[];
  }

  findByGroup(groupId: string): ExpenseSplit[] {
    const stmt = this.db.prepare(`
      SELECT es.* FROM expense_splits es
      INNER JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ?
      ORDER BY es.amount DESC
    `);

    return stmt.all(groupId) as ExpenseSplit[];
  }

  findByUserAndGroup(userId: string, groupId: string): ExpenseSplit[] {
    const stmt = this.db.prepare(`
      SELECT es.* FROM expense_splits es
      INNER JOIN expenses e ON es.expense_id = e.id
      WHERE es.user_id = ? AND e.group_id = ?
      ORDER BY es.amount DESC
    `);

    return stmt.all(userId, groupId) as ExpenseSplit[];
  }

  findByExpenseAndUser(expenseId: string, userId: string): ExpenseSplit | null {
    const stmt = this.db.prepare(`
      SELECT * FROM expense_splits
      WHERE expense_id = ? AND user_id = ?
    `);

    const row = stmt.get(expenseId, userId) as any;
    return row || null;
  }

  update(id: string, input: UpdateExpenseSplitInput): ExpenseSplit | null {
    if (input.amount === undefined) {
      return this.findById(id);
    }

    const stmt = this.db.prepare(`
      UPDATE expense_splits
      SET amount = ?
      WHERE id = ?
    `);

    const result = stmt.run(input.amount, id);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  updateByExpenseAndUser(expenseId: string, userId: string, amount: number): ExpenseSplit | null {
    const stmt = this.db.prepare(`
      UPDATE expense_splits
      SET amount = ?
      WHERE expense_id = ? AND user_id = ?
    `);

    const result = stmt.run(amount, expenseId, userId);

    if (result.changes === 0) {
      return null;
    }

    return this.findByExpenseAndUser(expenseId, userId);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM expense_splits WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteByExpense(expenseId: string): number {
    const stmt = this.db.prepare(`
      DELETE FROM expense_splits WHERE expense_id = ?
    `);

    const result = stmt.run(expenseId);
    return result.changes;
  }

  deleteByUser(userId: string): number {
    const stmt = this.db.prepare(`
      DELETE FROM expense_splits WHERE user_id = ?
    `);

    const result = stmt.run(userId);
    return result.changes;
  }

  getTotalForExpense(expenseId: string): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expense_splits WHERE expense_id = ?
    `);

    const result = stmt.get(expenseId) as { total: number };
    return result.total;
  }

  getTotalForUser(userId: string): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expense_splits WHERE user_id = ?
    `);

    const result = stmt.get(userId) as { total: number };
    return result.total;
  }

  getTotalForUserInGroup(userId: string, groupId: string): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(es.amount), 0) as total
      FROM expense_splits es
      INNER JOIN expenses e ON es.expense_id = e.id
      WHERE es.user_id = ? AND e.group_id = ?
    `);

    const result = stmt.get(userId, groupId) as { total: number };
    return result.total;
  }

  getAll(): ExpenseSplit[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expense_splits ORDER BY amount DESC
    `);

    return stmt.all() as ExpenseSplit[];
  }

  getSplitsSummary(expenseId: string): { user_id: string; amount: number }[] {
    const stmt = this.db.prepare(`
      SELECT user_id, amount FROM expense_splits WHERE expense_id = ? ORDER BY amount DESC
    `);

    return stmt.all(expenseId) as { user_id: string; amount: number }[];
  }
}
