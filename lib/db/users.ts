import Database from 'better-sqlite3';
import { hash } from 'bcrypt';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  image?: string;
}

/**
 * Database error wrapper for consistent error handling
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
 * Get user by email address
 */
export function getUserByEmail(db: Database.Database, email: string): User | null {
  try {
    const stmt = db.prepare(`
      SELECT * FROM users
      WHERE email = ?
      LIMIT 1
    `);

    const user = stmt.get(email) as User | undefined;
    return user || null;
  } catch (error) {
    handleDatabaseError('getUserByEmail', error);
  }
}

/**
 * Get user by ID
 */
export function getUserById(db: Database.Database, userId: string): User | null {
  try {
    const stmt = db.prepare(`
      SELECT * FROM users
      WHERE id = ?
      LIMIT 1
    `);

    const user = stmt.get(userId) as User | undefined;
    return user || null;
  } catch (error) {
    handleDatabaseError('getUserById', error);
  }
}

/**
 * Create a new user
 */
export function createUser(db: Database.Database, input: CreateUserInput): User {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, image, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.email, input.name, input.image || null, now, now);

    return {
      id,
      email: input.email,
      name: input.name,
      image: input.image,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    handleDatabaseError('createUser', error);
  }
}

/**
 * Update user information
 */
export function updateUser(db: Database.Database, userId: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): User | null {
  try {
    const existingUser = getUserById(db, userId);
    if (!existingUser) {
      return null;
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.image !== undefined) {
      fields.push('image = ?');
      values.push(updates.image);
    }

    if (fields.length === 0) {
      return existingUser;
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(userId);

    const stmt = db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return getUserById(db, userId);
  } catch (error) {
    handleDatabaseError('updateUser', error);
  }
}

/**
 * Delete user by ID
 */
export function deleteUser(db: Database.Database, userId: string): boolean {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(userId);
    return result.changes > 0;
  } catch (error) {
    handleDatabaseError('deleteUser', error);
  }
}

/**
 * List all users
 */
export function listUsers(db: Database.Database, limit: number = 100, offset: number = 0): User[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    return stmt.all(limit, offset) as User[];
  } catch (error) {
    handleDatabaseError('listUsers', error);
  }
}
