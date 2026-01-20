import Database from 'better-sqlite3';
import { User, CreateUserInput, UpdateUserInput } from './types';
import { hashPassword } from '@/lib/auth';

export class UserModel {
  constructor(private db: Database.Database) {
    this.initializeTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;

    this.db.exec(createTableQuery);
    this.db.exec(createIndexQuery);
  }

  create(input: CreateUserInput): User {
    const id = this.generateId();
    const password_hash = hashPassword(input.password);

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.email, password_hash, input.name, input.avatar_url || null);

    return this.findById(id)!;
  }

  findById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  findByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  findAll(limit: number = 100, offset: number = 0): User[] {
    const stmt = this.db.prepare('SELECT * FROM users LIMIT ? OFFSET ?');
    const rows = stmt.all(limit, offset) as any[];
    return rows.map(row => this.mapRowToUser(row));
  }

  update(id: string, input: UpdateUserInput): User | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.email !== undefined) {
      updates.push('email = ?');
      values.push(input.email);
    }
    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(input.avatar_url);
    }

    if (updates.length === 0) return existing;

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
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

  verifyPassword(email: string, password: string): User | null {
    const user = this.findByEmail(email);
    if (!user) return null;

    const bcrypt = require('bcrypt');
    const isValid = bcrypt.compareSync(password, user.password_hash);
    return isValid ? user : null;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      name: row.name,
      avatar_url: row.avatar_url || undefined,
      created_at: new Date(row.created_at)
    };
  }

  private generateId(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
