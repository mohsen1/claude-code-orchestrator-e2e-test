import Database from 'better-sqlite3';
import { getDatabase } from './connection';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: (db: Database.Database) => {
      // Users table
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          image TEXT,
          password_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Groups table
      db.exec(`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          currency TEXT DEFAULT 'USD',
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Group members junction table
      db.exec(`
        CREATE TABLE IF NOT EXISTS group_members (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(group_id, user_id)
        );
      `);

      // Expenses table
      db.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          description TEXT NOT NULL,
          amount REAL NOT NULL CHECK(amount >= 0),
          currency TEXT DEFAULT 'USD',
          paid_by TEXT NOT NULL REFERENCES users(id),
          category TEXT,
          expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Expense splits table
      db.exec(`
        CREATE TABLE IF NOT EXISTS expense_splits (
          id TEXT PRIMARY KEY,
          expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount REAL NOT NULL CHECK(amount >= 0),
          percentage REAL CHECK(percentage >= 0 AND percentage <= 100),
          UNIQUE(expense_id, user_id)
        );
      `);

      // Payments/Settlements table
      db.exec(`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount REAL NOT NULL CHECK(amount > 0),
          currency TEXT DEFAULT 'USD',
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
          notes TEXT,
          payment_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          CHECK(from_user_id != to_user_id)
        );
      `);

      // Invitations table
      db.exec(`
        CREATE TABLE IF NOT EXISTS invitations (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          invited_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'expired')),
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Sessions table for NextAuth
      db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires DATETIME NOT NULL,
          session_token TEXT UNIQUE NOT NULL
        );
      `);

      // Accounts table for NextAuth OAuth
      db.exec(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL,
          provider_account_id TEXT NOT NULL,
          access_token TEXT,
          refresh_token TEXT,
          expires_at DATETIME,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          UNIQUE(provider, provider_account_id)
        );
      `);

      // Create indexes for better query performance
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
        CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
        CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
        CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
        CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
        CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
        CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_group_id ON payments(group_id);
        CREATE INDEX IF NOT EXISTS idx_payments_from_user_id ON payments(from_user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_to_user_id ON payments(to_user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
        CREATE INDEX IF NOT EXISTS idx_invitations_group_id ON invitations(group_id);
        CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
        CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
      `);

      // Create migration tracking table
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    },
    down: (db: Database.Database) => {
      db.exec(`
        DROP INDEX IF EXISTS idx_accounts_user_id;
        DROP INDEX IF EXISTS idx_sessions_session_token;
        DROP INDEX IF EXISTS idx_sessions_user_id;
        DROP INDEX IF EXISTS idx_invitations_token;
        DROP INDEX IF EXISTS idx_invitations_group_id;
        DROP INDEX IF EXISTS idx_payments_status;
        DROP INDEX IF EXISTS idx_payments_to_user_id;
        DROP INDEX IF EXISTS idx_payments_from_user_id;
        DROP INDEX IF EXISTS idx_payments_group_id;
        DROP INDEX IF EXISTS idx_expense_splits_user_id;
        DROP INDEX IF EXISTS idx_expense_splits_expense_id;
        DROP INDEX IF EXISTS idx_expenses_expense_date;
        DROP INDEX IF EXISTS idx_expenses_paid_by;
        DROP INDEX IF EXISTS idx_expenses_group_id;
        DROP INDEX IF EXISTS idx_group_members_user_id;
        DROP INDEX IF EXISTS idx_group_members_group_id;
        DROP INDEX IF EXISTS idx_groups_created_by;
        DROP TABLE IF EXISTS accounts;
        DROP TABLE IF EXISTS sessions;
        DROP TABLE IF EXISTS invitations;
        DROP TABLE IF EXISTS payments;
        DROP TABLE IF EXISTS expense_splits;
        DROP TABLE IF EXISTS expenses;
        DROP TABLE IF EXISTS group_members;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS schema_migrations;
      `);
    }
  }
];

export function runMigrations(): void {
  const db = getDatabase();

  // Create migrations tracking table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Get current migration version
  const currentVersion = db
    .prepare('SELECT MAX(version) as version FROM schema_migrations')
    .get() as { version: number | null };

  const currentVersionNum = currentVersion.version || 0;

  // Run pending migrations
  const pendingMigrations = migrations.filter(
    (m) => m.version > currentVersionNum
  );

  for (const migration of pendingMigrations) {
    console.log(`Running migration: ${migration.name} (version ${migration.version})`);

    try {
      db.transaction(() => {
        migration.up(db);
        db.prepare(
          'INSERT INTO schema_migrations (version, name) VALUES (?, ?)'
        ).run(migration.version, migration.name);
      })();

      console.log(`Migration ${migration.name} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  console.log(`Database is up to date (version ${currentVersionNum})`);
}

export function rollbackMigration(version: number): void {
  const db = getDatabase();

  const migration = migrations.find((m) => m.version === version);
  if (!migration) {
    throw new Error(`Migration version ${version} not found`);
  }

  console.log(`Rolling back migration: ${migration.name} (version ${version})`);

  try {
    db.transaction(() => {
      migration.down(db);
      db.prepare('DELETE FROM schema_migrations WHERE version = ?').run(version);
    })();

    console.log(`Rollback of ${migration.name} completed successfully`);
  } catch (error) {
    console.error(`Rollback of ${migration.name} failed:`, error);
    throw error;
  }
}

export function getMigrationHistory(): Array<{ version: number; name: string; applied_at: string }> {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC')
    .all() as Array<{ version: number; name: string; applied_at: string }>;

  return rows;
}
