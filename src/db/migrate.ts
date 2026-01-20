import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeSchema } from './schema';

/**
 * Migration interface
 */
interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

/**
 * Migration definitions
 */
const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: (db: Database.Database) => {
      initializeSchema(db);
    },
    down: (db: Database.Database) => {
      db.exec(`
        DROP INDEX IF EXISTS idx_expense_splits_user_id;
        DROP INDEX IF EXISTS idx_expense_splits_expense_id;
        DROP INDEX IF EXISTS idx_expenses_created_at;
        DROP INDEX IF EXISTS idx_expenses_paid_by;
        DROP INDEX IF EXISTS idx_expenses_group_id;
        DROP INDEX IF EXISTS idx_group_members_user_id;
        DROP INDEX IF EXISTS idx_group_members_group_id;
        DROP INDEX IF EXISTS idx_groups_created_by;
        DROP INDEX IF EXISTS idx_users_email;
        DROP TABLE IF EXISTS expense_splits;
        DROP TABLE IF EXISTS expenses;
        DROP TABLE IF EXISTS group_members;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS users;
      `);
    },
  },
];

/**
 * Get database path
 */
function getDatabasePath(): string {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return path.join(dataDir, 'expense-sharing.db');
}

/**
 * Get or create migrations table
 */
function getMigrationVersion(db: Database.Database): number {
  const row = db
    .prepare(
      `
    SELECT version FROM schema_migrations WHERE id = 1
    `
    )
    .get() as { version: number } | undefined;

  return row?.version || 0;
}

/**
 * Set migration version
 */
function setMigrationVersion(db: Database.Database, version: number): void {
  db.prepare(
    `
    INSERT INTO schema_migrations (id, version) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET version = excluded.version
    `
  ).run(version);
}

/**
 * Initialize migrations table
 */
function initializeMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      version INTEGER NOT NULL
    )
  `);
}

/**
 * Run migrations up to latest
 */
export function migrateUp(db: Database.Database): void {
  initializeMigrationsTable(db);

  const currentVersion = getMigrationVersion(db);

  console.log(`Current migration version: ${currentVersion}`);

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration: ${migration.version} - ${migration.name}`);

      db.transaction(() => {
        migration.up(db);
        setMigrationVersion(db, migration.version);
      })();

      console.log(`Migration ${migration.version} completed`);
    }
  }

  console.log('All migrations completed');
}

/**
 * Rollback to specific version
 */
export function migrateDown(db: Database.Database, targetVersion: number): void {
  initializeMigrationsTable(db);

  const currentVersion = getMigrationVersion(db);

  if (currentVersion <= targetVersion) {
    console.log('No migrations to rollback');
    return;
  }

  // Rollback migrations in reverse order
  const reversedMigrations = [...migrations].reverse();

  for (const migration of reversedMigrations) {
    if (migration.version > targetVersion && migration.version <= currentVersion) {
      console.log(`Rolling back migration: ${migration.version} - ${migration.name}`);

      db.transaction(() => {
        migration.down(db);
        setMigrationVersion(db, migration.version - 1);
      })();

      console.log(`Migration ${migration.version} rolled back`);
    }
  }

  console.log('Rollback completed');
}

/**
 * Get database instance with migrations applied
 */
export function getDatabase(): Database.Database {
  const dbPath = getDatabasePath();
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Run migrations
  migrateUp(db);

  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(db: Database.Database): void {
  db.close();
}

/**
 * Reset database (drop all tables and re-run migrations)
 */
export function resetDatabase(db: Database.Database): void {
  console.log('Resetting database...');

  // Rollback all migrations
  migrateDown(db, 0);

  // Re-run migrations
  migrateUp(db);

  console.log('Database reset completed');
}
