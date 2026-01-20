import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'expense-sharing.db');
const db = new Database(dbPath);

// Initialize users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export default db;
