import { getDatabase, User } from './index';
import { hash } from 'bcryptjs';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(input: CreateUserInput): Promise<User> {
    const db = getDatabase();
    const password_hash = await hash(input.password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(input.email, password_hash, input.name);
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find user by ID
   */
  static findById(id: number): User | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | null;
  }

  /**
   * Find user by email
   */
  static findByEmail(email: string): User | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | null;
  }

  /**
   * Get all users
   */
  static findAll(): User[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as User[];
  }

  /**
   * Update user
   */
  static async update(id: number, input: UpdateUserInput): Promise<User | null> {
    const db = getDatabase();

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (input.email) {
      updates.push('email = ?');
      values.push(input.email);
    }
    if (input.password) {
      updates.push('password_hash = ?');
      values.push(await hash(input.password, 10));
    }
    if (input.name) {
      updates.push('name = ?');
      values.push(input.name);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  /**
   * Delete user
   */
  static delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Check if email exists
   */
  static emailExists(email: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
    const result = stmt.get(email) as { count: number };
    return result.count > 0;
  }
}
