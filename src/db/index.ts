import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initSchema, UserRepository } from './schema';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'expense-sharing.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database | null = null;
let userRepo: UserRepository | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    // Initialize schema
    initSchema(db);
  }
  return db;
}

export function getUserRepository(): UserRepository {
  if (!userRepo) {
    userRepo = new UserRepository(getDb());
  }
  return userRepo;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    userRepo = null;
  }
}

// Graceful shutdown
process.on('exit', closeDb);
process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});
process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});
