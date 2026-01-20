import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeSchema } from './schema';
import { ExpenseRepository } from './ExpenseRepository';
import { GroupRepository } from './GroupRepository';
import { MigrationManager } from './migrations';
import { SeedData } from './seed';

export * from './schema';
export { ExpenseRepository } from './ExpenseRepository';
export { GroupRepository } from './GroupRepository';
export { MigrationManager } from './migrations';
export { SeedData } from './seed';

let dbInstance: Database.Database | null = null;
let expenseRepoInstance: ExpenseRepository | null = null;
let groupRepoInstance: GroupRepository | null = null;
let migrationManagerInstance: MigrationManager | null = null;
let seedDataInstance: SeedData | null = null;

export function getDatabasePath(): string {
  const dbDir = process.env.DATABASE_DIR || path.join(process.cwd(), 'data');

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return path.join(dbDir, 'expense-share.db');
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDatabasePath();
    dbInstance = new Database(dbPath);

    // Enable foreign keys
    dbInstance.pragma('foreign_keys = ON');

    // Set WAL mode for better performance
    dbInstance.pragma('journal_mode = WAL');

    // Initialize schema if database is new
    const tables = dbInstance.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    if (tables.length === 0) {
      console.log('Initializing database schema...');
      initializeSchema(dbInstance);
      console.log('✓ Database schema initialized');
    }
  }

  return dbInstance;
}

export function getExpenseRepository(): ExpenseRepository {
  if (!expenseRepoInstance) {
    expenseRepoInstance = new ExpenseRepository(getDatabase());
  }
  return expenseRepoInstance;
}

export function getGroupRepository(): GroupRepository {
  if (!groupRepoInstance) {
    groupRepoInstance = new GroupRepository(getDatabase());
  }
  return groupRepoInstance;
}

export function getMigrationManager(): MigrationManager {
  if (!migrationManagerInstance) {
    migrationManagerInstance = new MigrationManager(getDatabase());
  }
  return migrationManagerInstance;
}

export function getSeedData(): SeedData {
  if (!seedDataInstance) {
    seedDataInstance = new SeedData(getDatabase());
  }
  return seedDataInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    expenseRepoInstance = null;
    groupRepoInstance = null;
    migrationManagerInstance = null;
    seedDataInstance = null;
  }
}

export function resetDatabase(): void {
  closeDatabase();

  const dbPath = getDatabasePath();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✓ Database file deleted');
  }

  // Also delete WAL files
  const walPath = dbPath + '-wal';
  const shmPath = dbPath + '-shm';

  if (fs.existsSync(walPath)) {
    fs.unlinkSync(walPath);
  }
  if (fs.existsSync(shmPath)) {
    fs.unlinkSync(shmPath);
  }
}

// Database health check
export function checkDatabaseHealth(): { healthy: boolean; error?: string } {
  try {
    const db = getDatabase();

    // Try to execute a simple query
    const result = db.prepare('SELECT 1').get();

    if (!result) {
      return { healthy: false, error: 'Database query returned no result' };
    }

    // Check if all tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_%'
    `).all() as Array<{ name: string }>;

    const requiredTables = ['users', 'groups', 'group_members', 'expenses', 'expense_splits', 'settlements'];
    const missingTables = requiredTables.filter(t => !tables.find(table => table.name === t));

    if (missingTables.length > 0) {
      return {
        healthy: false,
        error: `Missing tables: ${missingTables.join(', ')}`
      };
    }

    return { healthy: true };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Initialize database (run migrations)
export async function initializeDatabase(): Promise<void> {
  const migrationManager = getMigrationManager();
  await migrationManager.migrate();
  console.log('✓ Database initialized');
}

// Export a singleton instance
export const db = {
  get: getDatabase,
  expense: getExpenseRepository,
  group: getGroupRepository,
  migrations: getMigrationManager,
  seed: getSeedData,
  close: closeDatabase,
  reset: resetDatabase,
  health: checkDatabaseHealth,
  initialize: initializeDatabase,
};
