import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'expense-sharing.db');

let db: Database.Database | null = null;

/**
 * Get the database instance (singleton pattern)
 */
export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Create database connection
    db = new Database(DB_PATH);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Set busy timeout to 5 seconds
    db.pragma('busy_timeout = 5000');

    console.log('Database connected:', DB_PATH);
  }

  return db;
}

/**
 * Close the database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Initialize the database with schema
 */
export function initializeDatabase(): void {
  const database = getDb();

  // Read and execute schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Split schema into individual statements and execute
  const statements = schema
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);

  for (const statement of statements) {
    database.exec(statement);
  }

  console.log('Database schema initialized');
}

/**
 * Reset the database (drop all tables and recreate)
 * WARNING: This will delete all data!
 */
export function resetDatabase(): void {
  const database = getDb();

  // Drop all tables
  database.exec(`
    DROP TABLE IF EXISTS settlements;
    DROP TABLE IF EXISTS balances;
    DROP TABLE IF EXISTS expense_splits;
    DROP TABLE IF EXISTS expenses;
    DROP TABLE IF EXISTS group_members;
    DROP TABLE IF EXISTS groups;
    DROP TABLE IF EXISTS users;
  `);

  // Recreate schema
  initializeDatabase();

  console.log('Database reset complete');
}
