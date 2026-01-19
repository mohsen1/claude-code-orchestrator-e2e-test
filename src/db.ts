import Database from 'better-sqlite3';
import path from 'path';

// Database interface for type safety
export interface DatabaseInstance {
  prepare: (sql: string) => Database.Statement;
  exec: (sql: string) => void;
  close: () => void;
}

let db: Database.Database | null = null;

/**
 * Initialize the SQLite database and create the tasks table if it doesn't exist.
 * Uses environment variable DB_PATH or defaults to 'tasks.db' in the current directory.
 *
 * @returns Database instance
 * @throws Error if database initialization fails
 */
export function initializeDatabase(): DatabaseInstance {
  if (db) {
    return db;
  }

  const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'tasks.db');

  try {
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create tasks table with the required schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')),
        archived INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    console.log(`Database initialized successfully at: ${dbPath}`);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Task interface matching the database schema
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  archived?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating a new task (without id and timestamps)
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Input type for updating a task (all fields optional)
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  archived?: number;
}

/**
 * Get the current timestamp in ISO format
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Create a new task in the database.
 *
 * @param taskData - Task data (title, description, due_date, priority)
 * @returns The created task with generated id and timestamps
 * @throws Error if database operation fails or title is missing
 */
export function createTask(taskData: CreateTaskInput): Task {
  const database = initializeDatabase();

  if (!taskData.title || taskData.title.trim() === '') {
    throw new Error('Task title is required and cannot be empty');
  }

  const now = getCurrentTimestamp();

  try {
    const stmt = database.prepare(`
      INSERT INTO tasks (title, description, due_date, priority, archived, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      taskData.title,
      taskData.description || null,
      taskData.due_date || null,
      taskData.priority || null,
      0, // archived defaults to 0
      now,
      now
    );

    // Return the created task
    return getTaskById(result.lastInsertRowid as number);
  } catch (error) {
    throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all tasks from the database.
 *
 * @returns Array of all tasks (excluding archived tasks unless specified)
 * @throws Error if database operation fails
 */
export function getAllTasks(includeArchived: boolean = false): Task[] {
  const database = initializeDatabase();

  try {
    let sql = 'SELECT * FROM tasks';
    if (!includeArchived) {
      sql += ' WHERE archived = 0';
    }
    sql += ' ORDER BY created_at DESC';

    const stmt = database.prepare(sql);
    return stmt.all() as Task[];
  } catch (error) {
    throw new Error(`Failed to get tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a single task by its ID.
 *
 * @param id - Task ID
 * @returns The task if found
 * @throws Error if task not found or database operation fails
 */
export function getTaskById(id: number): Task {
  const database = initializeDatabase();

  try {
    const stmt = database.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id) as Task | undefined;

    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }

    return task;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    throw new Error(`Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing task by its ID.
 * Only updates the fields provided in the update data.
 * Automatically updates the updated_at timestamp.
 *
 * @param id - Task ID
 * @param updateData - Fields to update (title, description, due_date, priority, archived)
 * @returns The updated task
 * @throws Error if task not found or database operation fails
 */
export function updateTask(id: number, updateData: UpdateTaskInput): Task {
  const database = initializeDatabase();

  // First check if task exists
  try {
    getTaskById(id);
  } catch (error) {
    throw error;
  }

  const now = getCurrentTimestamp();

  // Build the UPDATE query dynamically based on provided fields
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updateData.title !== undefined) {
    if (updateData.title.trim() === '') {
      throw new Error('Task title cannot be empty');
    }
    fields.push('title = ?');
    values.push(updateData.title);
  }

  if (updateData.description !== undefined) {
    fields.push('description = ?');
    values.push(updateData.description);
  }

  if (updateData.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(updateData.due_date);
  }

  if (updateData.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updateData.priority);
  }

  if (updateData.archived !== undefined) {
    fields.push('archived = ?');
    values.push(updateData.archived);
  }

  if (fields.length === 0) {
    throw new Error('No fields provided for update');
  }

  // Add updated_at timestamp
  fields.push('updated_at = ?');
  values.push(now);

  // Add id for WHERE clause
  values.push(id);

  try {
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = database.prepare(sql);
    stmt.run(...values);

    // Return the updated task
    return getTaskById(id);
  } catch (error) {
    throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a task by its ID (soft delete).
 * Sets the archived flag to 1 instead of removing the record.
 *
 * @param id - Task ID
 * @returns The archived task
 * @throws Error if task not found or database operation fails
 */
export function deleteTask(id: number): Task {
  const database = initializeDatabase();

  try {
    // Soft delete by setting archived to 1
    return updateTask(id, { archived: 1 });
  } catch (error) {
    throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Permanently delete a task from the database (hard delete).
 * Use with caution - this operation cannot be undone.
 *
 * @param id - Task ID
 * @returns true if deletion was successful
 * @throws Error if task not found or database operation fails
 */
export function permanentlyDeleteTask(id: number): boolean {
  const database = initializeDatabase();

  try {
    const stmt = database.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error(`Task with id ${id} not found`);
    }

    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    throw new Error(`Failed to permanently delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Close the database connection.
 * Should be called when shutting down the application.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

// Export the Database type for use in other modules
export type { Database };

/**
 * Get database instance for direct queries if needed.
 * This provides access to the underlying better-sqlite3 Database instance.
 *
 * @returns Database instance or null if not initialized
 */
export function getDatabaseInstance(): Database.Database | null {
  return db;
}
