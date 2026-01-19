import Database from 'better-sqlite3';
import path from 'path';
import { Task } from './models/task';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../tasks.db');

export const db = new Database(dbPath);

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

export function createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, due_date, priority, archived)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.title,
    data.description || null,
    data.due_date || null,
    data.priority,
    data.archived ? 1 : 0
  );

  const task = getTaskById(result.lastInsertRowid as number);
  if (!task) {
    throw new Error('Failed to create task');
  }
  return task;
}

export function getAllTasks(): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE archived = 0 ORDER BY created_at DESC');
  const rows = stmt.all() as any[];
  return rows.map(row => ({
    ...row,
    archived: Boolean(row.archived)
  }));
}

export function getTaskById(id: number): Task | null {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const row = stmt.get(id) as any;
  if (!row) return null;
  return {
    ...row,
    archived: Boolean(row.archived)
  };
}

export function updateTask(id: number, data: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Task | null {
  const current = getTaskById(id);
  if (!current) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(data.due_date);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    values.push(data.priority);
  }
  if (data.archived !== undefined) {
    updates.push('archived = ?');
    values.push(data.archived ? 1 : 0);
  }

  updates.push('updated_at = datetime("now")');
  values.push(id);

  const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getTaskById(id);
}

export function deleteTask(id: number): boolean {
  const stmt = db.prepare('UPDATE tasks SET archived = 1, updated_at = datetime("now") WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function hardDeleteTask(id: number): boolean {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export { db as default };
