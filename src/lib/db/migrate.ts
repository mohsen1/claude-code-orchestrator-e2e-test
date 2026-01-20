import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Migration interface
 */
interface Migration {
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

/**
 * Define all migrations in order
 */
const migrations: Migration[] = [
  {
    name: '001_initial_schema',
    up: (db: Database.Database) => {
      // This is handled by schema.sql
      console.log('Migration 001_initial_schema: Applied via schema.sql');
    },
    down: (db: Database.Database) => {
      db.exec(`
        DROP TABLE IF EXISTS settlements;
        DROP TABLE IF EXISTS balances;
        DROP TABLE IF EXISTS expense_splits;
        DROP TABLE IF EXISTS expenses;
        DROP TABLE IF EXISTS group_members;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS users;
      `);
      console.log('Migration 001_initial_schema: Rolled back');
    },
  },
  {
    name: '002_add_expense_category',
    up: (db: Database.Database) => {
      // Add category column to expenses if it doesn't exist
      try {
        db.exec(`
          ALTER TABLE expenses ADD COLUMN category TEXT;
        `);
        console.log('Migration 002_add_expense_category: Applied');
      } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
          console.log('Migration 002_add_expense_category: Already applied');
        } else {
          throw error;
        }
      }
    },
    down: (db: Database.Database) => {
      // SQLite doesn't support ALTER TABLE DROP COLUMN
      // Need to recreate table without the column
      db.exec(`
        CREATE TABLE expenses_new (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          currency TEXT DEFAULT 'USD',
          paid_by TEXT NOT NULL REFERENCES users(id),
          expense_date INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        INSERT INTO expenses_new
        SELECT id, group_id, description, amount, currency, paid_by, expense_date, created_at, updated_at
        FROM expenses;

        DROP TABLE expenses;
        ALTER TABLE expenses_new RENAME TO expenses;
      `);
      console.log('Migration 002_add_expense_category: Rolled back');
    },
  },
  {
    name: '003_add_updated_at_trigger',
    up: (db: Database.Database) => {
      // Create trigger for automatic updated_at timestamps
      const triggerUsers = `
        CREATE TRIGGER IF NOT EXISTS update_users_timestamp
        AFTER UPDATE ON users
        BEGIN
          UPDATE users SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
        END;
      `;

      const triggerGroups = `
        CREATE TRIGGER IF NOT EXISTS update_groups_timestamp
        AFTER UPDATE ON groups
        BEGIN
          UPDATE groups SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
        END;
      `;

      const triggerExpenses = `
        CREATE TRIGGER IF NOT EXISTS update_expenses_timestamp
        AFTER UPDATE ON expenses
        BEGIN
          UPDATE expenses SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
        END;
      `;

      const triggerBalances = `
        CREATE TRIGGER IF NOT EXISTS update_balances_timestamp
        AFTER UPDATE ON balances
        BEGIN
          UPDATE balances SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
        END;
      `;

      db.exec(triggerUsers);
      db.exec(triggerGroups);
      db.exec(triggerExpenses);
      db.exec(triggerBalances);

      console.log('Migration 003_add_updated_at_trigger: Applied');
    },
    down: (db: Database.Database) => {
      db.exec(`
        DROP TRIGGER IF EXISTS update_users_timestamp;
        DROP TRIGGER IF EXISTS update_groups_timestamp;
        DROP TRIGGER IF EXISTS update_expenses_timestamp;
        DROP TRIGGER IF EXISTS update_balances_timestamp;
      `);
      console.log('Migration 003_add_updated_at_trigger: Rolled back');
    },
  },
];

/**
 * Create migrations tracking table if it doesn't exist
 */
function ensureMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);
}

/**
 * Get list of applied migrations
 */
function getAppliedMigrations(db: Database.Database): Set<string> {
  const rows = db.prepare('SELECT name FROM _migrations').all() as { name: string }[];
  return new Set(rows.map((row) => row.name));
}

/**
 * Run pending migrations
 */
export function migrateUp(db: Database.Database): void {
  ensureMigrationsTable(db);
  const appliedMigrations = getAppliedMigrations(db);

  for (const migration of migrations) {
    if (!appliedMigrations.has(migration.name)) {
      console.log(`Applying migration: ${migration.name}`);
      migration.up(db);

      // Record migration
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name);
      console.log(`Migration ${migration.name} applied successfully`);
    } else {
      console.log(`Migration ${migration.name} already applied, skipping`);
    }
  }

  console.log('All migrations up to date');
}

/**
 * Rollback migrations (down to specific migration or all)
 */
export function migrateDown(db: Database.Database, targetMigration?: string): void {
  ensureMigrationsTable(db);
  const appliedMigrations = getAppliedMigrations(db);

  // Reverse migrations to get rollback order
  const reversedMigrations = [...migrations].reverse();

  for (const migration of reversedMigrations) {
    if (appliedMigrations.has(migration.name)) {
      if (targetMigration && migration.name === targetMigration) {
        break;
      }

      console.log(`Rolling back migration: ${migration.name}`);
      migration.down(db);

      // Remove migration record
      db.prepare('DELETE FROM _migrations WHERE name = ?').run(migration.name);
      console.log(`Migration ${migration.name} rolled back successfully`);
    }
  }

  console.log('Migration rollback complete');
}

/**
 * Get current migration status
 */
export function getMigrationStatus(db: Database.Database): {
  applied: string[];
  pending: string[];
} {
  ensureMigrationsTable(db);
  const appliedMigrations = getAppliedMigrations(db);

  return {
    applied: migrations.filter((m) => appliedMigrations.has(m.name)).map((m) => m.name),
    pending: migrations.filter((m) => !appliedMigrations.has(m.name)).map((m) => m.name),
  };
}
