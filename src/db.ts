import Database from 'better-sqlite3';
import path from 'path';
import { Task, CreateTaskInput, UpdateTaskInput } from './models/task';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../tasks.db');

const db = new Database(dbPath);

// Create tasks table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export const dbApi = {
  getAllTasks: (): Task[] => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE archived = 0 ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      archived: Boolean(row.archived),
    }));
  },

  getTaskById: (id: number): Task | null => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      ...row,
      archived: Boolean(row.archived),
    };
  },

  createTask: (input: CreateTaskInput): Task => {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, priority)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.title,
      input.description || null,
      input.due_date || null,
      input.priority || 'medium'
    );
    const created = db.getTaskById(result.lastInsertRowid as number);
    if (!created) throw new Error('Failed to create task');
    return created;
  },

  updateTask: (id: number, input: UpdateTaskInput): Task | null => {
    const existing = db.getTaskById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(input.due_date);
    }
    if (input.priority !== undefined) {
      updates.push('priority = ?');
      values.push(input.priority);
    }
    if (input.archived !== undefined) {
      updates.push('archived = ?');
      values.push(input.archived ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = datetime("now")');
      values.push(id);
      const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }

    return db.getTaskById(id);
  },

  deleteTask: (id: number): Task | null => {
    const existing = db.getTaskById(id);
    if (!existing) return null;

    const stmt = db.prepare('UPDATE tasks SET archived = 1, updated_at = datetime("now") WHERE id = ?');
    stmt.run(id);
    return db.getTaskById(id);
  },
};

export default dbApi;
