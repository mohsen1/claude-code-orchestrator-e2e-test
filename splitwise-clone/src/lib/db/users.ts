import { getDb, generateId } from './index';
import { User } from './schema';

export interface CreateUserInput {
  email: string;
  password_hash: string;
  name: string;
}

export function createUser(input: CreateUserInput): User {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, input.email.toLowerCase(), input.password_hash, input.name);

  return getUserById(id)!;
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email.toLowerCase()) as User | null;
}

export function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name' | 'password_hash'>>
): User | null {
  const db = getDb();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }

  if (updates.password_hash !== undefined) {
    fields.push('password_hash = ?');
    values.push(updates.password_hash);
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  stmt.run(...values);
  return getUserById(id);
}

export function deleteUser(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
