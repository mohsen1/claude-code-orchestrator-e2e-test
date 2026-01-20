import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Initialize database connection
  const dbPath = join(process.cwd(), 'data', 'expenses.db');
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Initialize schema
  const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Type definitions
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  joined_at: string;
}

export interface Expense {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  paid_by: number;
  created_at: string;
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: number;
  amount: number;
}

export interface Balance {
  id: number;
  group_id: number;
  from_user_id: number;
  to_user_id: number;
  amount: number;
  is_settled: number;
  created_at: string;
  updated_at: string;
}

export interface UserWithBalance extends User {
  balance?: number;
}
