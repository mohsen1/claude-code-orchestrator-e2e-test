import Database from 'better-sqlite3';
import DatabaseManager from './connection';
import { runMigrations, getMigrationHistory, rollbackMigration } from './migrations';

// Re-export connection utilities
export {
  DatabaseManager,
  getDatabase,
  closeDatabase,
  type DatabaseConnection
} from './connection';

// Re-export migration utilities
export {
  runMigrations,
  getMigrationHistory,
  rollbackMigration,
  type Migration
} from './migrations';

// Health check interface
export interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  connected: boolean;
  size: number;
  walEnabled: boolean;
  foreignKeysEnabled: boolean;
  tables: string[];
  currentMigrationVersion: number | null;
  lastError?: string;
}

/**
 * Initialize the database with migrations
 */
export function initializeDatabase(): void {
  try {
    const manager = DatabaseManager.getInstance();
    const connection = manager.getConnection();

    // Run migrations
    runMigrations();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Check database health and return diagnostic information
 */
export function healthCheck(): DatabaseHealth {
  try {
    const manager = DatabaseManager.getInstance();
    const connection = manager.getConnection();

    if (!connection.isConnected()) {
      return {
        status: 'unhealthy',
        connected: false,
        size: 0,
        walEnabled: false,
        foreignKeysEnabled: false,
        tables: [],
        currentMigrationVersion: null,
        lastError: 'Not connected'
      };
    }

    const db = connection.db;

    // Check if WAL mode is enabled
    const walResult = db.pragma('journal_mode', { simple: true });
    const walEnabled = walResult === 'wal';

    // Check if foreign keys are enabled
    const fkResult = db.pragma('foreign_keys', { simple: true });
    const foreignKeysEnabled = fkResult === 1;

    // Get list of tables
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all() as Array<{ name: string }>;
    const tableNames = tables.map((t) => t.name);

    // Get current migration version
    const migrationResult = db
      .prepare('SELECT MAX(version) as version FROM schema_migrations')
      .get() as { version: number | null };
    const currentMigrationVersion = migrationResult.version || null;

    // Get database size
    const dbPath = manager.getDbPath();
    const fs = require('fs');
    let size = 0;
    try {
      const stats = fs.statSync(dbPath);
      size = stats.size;
    } catch {
      // File doesn't exist yet
    }

    return {
      status: 'healthy',
      connected: true,
      size,
      walEnabled,
      foreignKeysEnabled,
      tables: tableNames,
      currentMigrationVersion
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      size: 0,
      walEnabled: false,
      foreignKeysEnabled: false,
      tables: [],
      currentMigrationVersion: null,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Execute a raw SQL query with optional parameters
 * Use with caution - prefer prepared statements when possible
 */
export function executeRaw<T = any>(
  sql: string,
  params: any[] = []
): T[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

/**
 * Execute a raw SQL query that returns a single row
 */
export function executeRawOne<T = any>(
  sql: string,
  params: any[] = []
): T | undefined {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
}

/**
 * Execute a raw SQL statement (INSERT, UPDATE, DELETE, etc.)
 */
export function executeRawRun(
  sql: string,
  params: any[] = []
): { changes: number; lastInsertRowid: number | bigint } {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

/**
 * Execute multiple statements in a transaction
 */
export function executeTransaction<T>(
  callback: (db: Database.Database) => T
): T {
  const db = getDatabase();
  return db.transaction(callback)(db);
}

/**
 * Get database statistics
 */
export interface DatabaseStats {
  userCount: number;
  groupCount: number;
  expenseCount: number;
  paymentCount: number;
  totalExpenseAmount: number;
  totalPaymentAmount: number;
}

export function getDatabaseStats(): DatabaseStats {
  const db = getDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const groupCount = db.prepare('SELECT COUNT(*) as count FROM groups').get() as { count: number };
  const expenseCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get() as { count: number };
  const paymentCount = db.prepare('SELECT COUNT(*) as count FROM payments').get() as { count: number };
  const totalExpenseAmount = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get() as { total: number };
  const totalPaymentAmount = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = "completed"').get() as { total: number };

  return {
    userCount: userCount.count,
    groupCount: groupCount.count,
    expenseCount: expenseCount.count,
    paymentCount: paymentCount.count,
    totalExpenseAmount: totalExpenseAmount.total,
    totalPaymentAmount: totalPaymentAmount.total
  };
}

/**
 * Close the database connection (typically called on application shutdown)
 */
export function shutdown(): void {
  closeDatabase();
  console.log('Database connection closed');
}
