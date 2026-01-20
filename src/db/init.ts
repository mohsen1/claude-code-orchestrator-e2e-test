import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrations';

// Database file path
const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'expenses.db');

let db: Database.Database | null = null;

/**
 * Initialize the SQLite database connection
 * Creates the data directory if it doesn't exist
 */
export function initializeDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Create database connection
  db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Set WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');

  // Run migrations
  runMigrations(db);

  console.log('Database initialized successfully');

  return db;
}

/**
 * Get the database instance
 * Initializes if not already initialized
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Reset the database (drop all tables and recreate)
 * WARNING: This will delete all data!
 * Only use in development or testing
 */
export function resetDatabase(): void {
  if (db) {
    closeDatabase();
  }

  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Database file deleted');
  }

  // Also delete WAL files if they exist
  const walPath = DB_PATH + '-wal';
  const shmPath = DB_PATH + '-shm';

  if (fs.existsSync(walPath)) {
    fs.unlinkSync(walPath);
  }
  if (fs.existsSync(shmPath)) {
    fs.unlinkSync(shmPath);
  }

  initializeDatabase();
}

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
  size: number;
  tables: string[];
  version: string;
} {
  const database = getDatabase();

  const size = fs.existsSync(DB_PATH)
    ? fs.statSync(DB_PATH).size
    : 0;

  const tables = database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all() as { name: string }[];

  const version = database.pragma('user_version', { simple: true }) as number;

  return {
    size,
    tables: tables.map((t) => t.name),
    version: version.toString(),
  };
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('exit', closeDatabase);
  process.on('SIGINT', () => {
    closeDatabase();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    closeDatabase();
    process.exit(0);
  });
}
