import Database from 'better-sqlite3';
import { User } from '../schema';

/**
 * User model operations
 */
export class UserModel {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Find user by ID
   */
  findById(id: string): User | null {
    const row = this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as User | undefined;

    return row || null;
  }

  /**
   * Find user by email
   */
  findByEmail(email: string): User | null {
    const row = this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined;

    return row || null;
  }

  /**
   * Create or update user (upsert)
   */
  upsert(user: Omit<User, 'created_at' | 'updated_at'>): User {
    const now = Date.now();
    const existing = this.findById(user.id);

    if (existing) {
      // Update existing user
      const updatedUser: User = {
        ...user,
        created_at: existing.created_at,
        updated_at: now,
      };

      this.db
        .prepare(
          `
          UPDATE users
          SET email = ?, name = ?, image = ?, updated_at = ?
          WHERE id = ?
        `
        )
        .run(updatedUser.email, updatedUser.name, updatedUser.image, updatedUser.updated_at, updatedUser.id);

      return updatedUser;
    } else {
      // Create new user
      const newUser: User = {
        ...user,
        created_at: now,
        updated_at: now,
      };

      this.db
        .prepare(
          `
          INSERT INTO users (id, email, name, image, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `
        )
        .run(newUser.id, newUser.email, newUser.name, newUser.image, newUser.created_at, newUser.updated_at);

      return newUser;
    }
  }

  /**
   * Update user
   */
  update(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): User | null {
    const existing = this.findById(id);

    if (!existing) {
      return null;
    }

    const updatedUser: User = {
      ...existing,
      ...updates,
      updated_at: Date.now(),
    };

    this.db
      .prepare(
        `
        UPDATE users
        SET email = ?, name = ?, image = ?, updated_at = ?
        WHERE id = ?
      `
      )
      .run(updatedUser.email, updatedUser.name, updatedUser.image, updatedUser.updated_at, updatedUser.id);

    return updatedUser;
  }

  /**
   * Delete user
   */
  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Get all users
   */
  getAll(): User[] {
    return this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
  }

  /**
   * Search users by name or email
   */
  search(query: string): User[] {
    const searchTerm = `%${query}%`;
    return this.db
      .prepare(
        `
        SELECT * FROM users
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY name ASC
        LIMIT 20
      `
      )
      .all(searchTerm, searchTerm) as User[];
  }
}

/**
 * Create user model instance
 */
export function createUserModel(db: Database.Database): UserModel {
  return new UserModel(db);
}
