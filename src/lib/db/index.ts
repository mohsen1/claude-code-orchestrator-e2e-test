import { Database } from 'better-sqlite3';
import { initializeDatabase } from './schema';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || 'expenses.db';
    db = initializeDatabase(dbPath);
  }
  return db;
}

// Close the database connection (useful for cleanup)
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Reset database (useful for testing)
export function resetDb() {
  closeDb();
  const fs = require('fs');
  const dbPath = process.env.DATABASE_PATH || 'expenses.db';
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  return getDb();
}
