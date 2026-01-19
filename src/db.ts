import Database from 'better-sqlite3';
import path from 'path';
import { Task, CreateTaskInput, UpdateTaskInput } from './models/task';

class SQLiteDatabase {
  private db: Database.Database | null = null;

  initialize(): void {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../tasks.db');
    this.db = new Database(dbPath);

    // Create tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        archived INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Create index on archived for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived)
    `);
  }

  private ensureInitialized(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  getAllTasks(): Task[] {
    const db = this.ensureInitialized();
    const stmt = db.prepare(`
      SELECT id, title, description, due_date, priority, created_at, updated_at, archived
      FROM tasks
      WHERE archived = 0
      ORDER BY created_at DESC
    `);
    return stmt.all() as Task[];
  }

  getTaskById(id: number): Task | undefined {
    const db = this.ensureInitialized();
    const stmt = db.prepare(`
      SELECT id, title, description, due_date, priority, created_at, updated_at, archived
      FROM tasks
      WHERE id = ? AND archived = 0
    `);
    return stmt.get(id) as Task | undefined;
  }

  createTask(task: CreateTaskInput): Task {
    const db = this.ensureInitialized();
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, priority)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      task.title,
      task.description || null,
      task.due_date || null,
      task.priority || 'medium'
    );

    const createdTask = this.getTaskById(result.lastInsertRowid as number);
    if (!createdTask) {
      throw new Error('Failed to create task');
    }
    return createdTask;
  }

  updateTask(id: number, task: UpdateTaskInput): Task | undefined {
    const db = this.ensureInitialized();

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (task.title !== undefined) {
      updates.push('title = ?');
      values.push(task.title);
    }
    if (task.description !== undefined) {
      updates.push('description = ?');
      values.push(task.description);
    }
    if (task.due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(task.due_date);
    }
    if (task.priority !== undefined) {
      updates.push('priority = ?');
      values.push(task.priority);
    }

    if (updates.length === 0) {
      return this.getTaskById(id);
    }

    // Add updated_at timestamp
    updates.push("updated_at = datetime('now')");

    // Add WHERE clause parameter
    values.push(id);

    const stmt = db.prepare(`
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = ? AND archived = 0
    `);

    stmt.run(...values);
    return this.getTaskById(id);
  }

  deleteTask(id: number): boolean {
    const db = this.ensureInitialized();
    const stmt = db.prepare(`
      UPDATE tasks
      SET archived = 1, updated_at = datetime('now')
      WHERE id = ? AND archived = 0
    `);
    const result = stmt.run(id);
    return (result.changes ?? 0) > 0;
  }
}

// Export singleton instance
export const db = new SQLiteDatabase();

// Export Task type for convenience
export type { Task, CreateTaskInput, UpdateTaskInput };
