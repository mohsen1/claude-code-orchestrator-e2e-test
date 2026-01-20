import Database from 'better-sqlite3';
import { path } from 'path';
import { schema, indexes, triggers } from './schema';

// Database file path
const DB_PATH = process.env.DATABASE_PATH || './data/expenses.db';

// Singleton instance
let db: Database.Database | null = null;

/**
 * Get or create the database connection singleton
 */
export function getDb(): Database.Database {
  if (!db) {
    // Ensure the directory exists
    const fs = require('fs');
    const dir = require('path').dirname(DB_PATH);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create database connection
    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Set WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Initialize schema
    initializeSchema(db);
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
  }
}

/**
 * Initialize database schema
 */
function initializeSchema(database: Database.Database): void {
  // Enable foreign keys
  database.pragma('foreign_keys = ON');

  // Create all tables
  Object.values(schema).forEach((createTableSQL) => {
    database.exec(createTableSQL);
  });

  // Create all indexes
  Object.values(indexes).forEach((createIndexSQL) => {
    database.exec(createIndexSQL);
  });

  // Create all triggers
  Object.values(triggers).forEach((createTriggerSQL) => {
    database.exec(createTriggerSQL);
  });

  console.log('Database schema initialized successfully');
}

/**
 * Reset database (drop all tables and recreate)
 * WARNING: This will delete all data!
 */
export function resetDatabase(): void {
  const database = getDb();

  // Disable foreign keys temporarily
  database.pragma('foreign_keys = OFF');

  // Get all table names
  const tables = database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all() as Array<{ name: string }>;

  // Drop all tables
  tables.forEach(({ name }) => {
    database.exec(`DROP TABLE IF EXISTS ${name}`);
  });

  // Re-enable foreign keys
  database.pragma('foreign_keys = ON');

  // Recreate schema
  initializeSchema(database);

  console.log('Database reset successfully');
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  try {
    const database = getDb();
    const result = database
      .prepare(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='users'"
      )
      .get() as { count: number };

    return result.count > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
  tables: Array<{ name: string; rows: number }>;
  totalRows: number;
} {
  const database = getDb();

  const tables = database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    .all() as Array<{ name: string }>;

  const stats = tables.map(({ name }) => {
    const result = database
      .prepare(`SELECT COUNT(*) as count FROM ${name}`)
      .get() as { count: number };

    return { name, rows: result.count };
  });

  const totalRows = stats.reduce((sum, table) => sum + table.rows, 0);

  return { tables: stats, totalRows };
}

/**
 * Backup database
 */
export function backupDatabase(backupPath: string): void {
  const database = getDb();
  const backup = new Database(backupPath);
  database.backup(backup).then(() => {
    backup.close();
    console.log(`Database backed up to ${backupPath}`);
  });
}

/**
 * Execute a transaction
 */
export function transaction<T>(
  fn: (db: Database.Database) => T
): T {
  const database = getDb();
  const txn = database.transaction(fn);
  return txn(database);
}

/**
 * Health check for database
 */
export function healthCheck(): {
  healthy: boolean;
  path: string;
  size: number;
  error?: string;
} {
  try {
    const database = getDb();

    // Try to execute a simple query
    database.prepare('SELECT 1').get();

    // Get file size
    const fs = require('fs');
    const stats = fs.statSync(DB_PATH);

    return {
      healthy: true,
      path: DB_PATH,
      size: stats.size,
    };
  } catch (error) {
    return {
      healthy: false,
      path: DB_PATH,
      size: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export database instance getter as default
export default getDb;
