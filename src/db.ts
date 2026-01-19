import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../tasks.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tasks table
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

// Create index on archived for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived)
`);

export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  archived: number;
  created_at: string;
  updated_at: string;
}

export function getAllTasks(): TaskRow[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE archived = 0 ORDER BY created_at DESC');
  return stmt.all() as TaskRow[];
}

export function getTaskById(id: number): TaskRow | undefined {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND archived = 0');
  return stmt.get(id) as TaskRow | undefined;
}

export function createTask(data: {
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
}): TaskRow {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, due_date, priority)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.title,
    data.description || null,
    data.due_date || null,
    data.priority || 'medium'
  );

  const task = getTaskById(result.lastInsertRowid as number);
  if (!task) {
    throw new Error('Failed to create task');
  }
  return task;
}

export function updateTask(id: number, data: {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: string;
}): TaskRow | undefined {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(data.due_date);
  }
  if (data.priority !== undefined) {
    fields.push('priority = ?');
    values.push(data.priority);
  }

  if (fields.length === 0) {
    return getTaskById(id);
  }

  fields.push('updated_at = datetime("now")');
  values.push(id);

  const stmt = db.prepare(`
    UPDATE tasks
    SET ${fields.join(', ')}
    WHERE id = ? AND archived = 0
  `);

  stmt.run(...values);
  return getTaskById(id);
}

export function softDeleteTask(id: number): TaskRow | undefined {
  const stmt = db.prepare(`
    UPDATE tasks
    SET archived = 1, updated_at = datetime('now')
    WHERE id = ? AND archived = 0
  `);
  stmt.run(id);

  // Return the task before deletion
  const task = getTaskById(id);
  return task;
}

export default db;
