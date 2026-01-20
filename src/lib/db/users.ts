import Database from 'better-sqlite3';
import { User } from '@/types';

export class UsersDB {
  constructor(private db: Database.Database) {
    this.initTable();
  }

  private initTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT,
        google_id TEXT UNIQUE,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  insert(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): User {
    const id = user.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name, password, google_id, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      user.email,
      user.name,
      user.password || null,
      user.googleId || null,
      user.avatarUrl || null,
      now,
      now
    );

    return {
      id,
      email: user.email,
      name: user.name,
      password: user.password || null,
      googleId: user.googleId || null,
      avatarUrl: user.avatarUrl || null,
      createdAt: now,
      updatedAt: now
    };
  }

  findById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      googleId: row.google_id,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  findByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      googleId: row.google_id,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  findByGoogleId(googleId: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE google_id = ?');
    const row = stmt.get(googleId) as any;

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      googleId: row.google_id,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): User | null {
    const existing = this.findById(id);
    if (!existing) return null;

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
    if (updates.password !== undefined) {
      fields.push('password = ?');
      values.push(updates.password);
    }
    if (updates.googleId !== undefined) {
      fields.push('google_id = ?');
      values.push(updates.googleId);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatarUrl);
    }

    if (fields.length === 0) return existing;

    fields.push('updated_at = ?');
    const now = new Date().toISOString();
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getAll(limit?: number, offset?: number): User[] {
    let query = 'SELECT * FROM users ORDER BY created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      googleId: row.google_id,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }
}
