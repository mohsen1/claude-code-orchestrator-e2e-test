import Database from 'better-sqlite3';

interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

/**
 * Migration 1: Create initial schema
 * - users table for authentication
 * - groups table for expense groups
 * - members table for group memberships
 * - expenses table for expenses
 * - settlements table for tracking settlements
 */
const migration1: Migration = {
  version: 1,
  name: 'initial_schema',
  up: (db: Database.Database) => {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        password_hash TEXT,
        provider TEXT DEFAULT 'local',
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
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Members table (group memberships)
    db.exec(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      );
    `);

    // Expenses table
    db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        paid_by TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        category TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (paid_by) REFERENCES users(id)
      );
    `);

    // Expense splits table (how expenses are split among members)
    db.exec(`
      CREATE TABLE IF NOT EXISTS expense_splits (
        id TEXT PRIMARY KEY,
        expense_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        percentage REAL,
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(expense_id, user_id)
      );
    `);

    // Settlements table
    db.exec(`
      CREATE TABLE IF NOT EXISTS settlements (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        from_user_id TEXT NOT NULL,
        to_user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending',
        settled_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id)
      );
    `);

    // Create indexes for better query performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
      CREATE INDEX IF NOT EXISTS idx_members_group_id ON members(group_id);
      CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
      CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
      CREATE INDEX IF NOT EXISTS idx_settlements_group_id ON settlements(group_id);
      CREATE INDEX IF NOT EXISTS idx_settlements_from_user ON settlements(from_user_id);
      CREATE INDEX IF NOT EXISTS idx_settlements_to_user ON settlements(to_user_id);
      CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
    `);
  },
  down: (db: Database.Database) => {
    db.exec(`
      DROP INDEX IF EXISTS idx_settlements_status;
      DROP INDEX IF EXISTS idx_settlements_to_user;
      DROP INDEX IF EXISTS idx_settlements_from_user;
      DROP INDEX IF EXISTS idx_settlements_group_id;
      DROP INDEX IF EXISTS idx_expense_splits_user_id;
      DROP INDEX IF EXISTS idx_expense_splits_expense_id;
      DROP INDEX IF EXISTS idx_expenses_date;
      DROP INDEX IF EXISTS idx_expenses_paid_by;
      DROP INDEX IF EXISTS idx_expenses_group_id;
      DROP INDEX IF EXISTS idx_members_user_id;
      DROP INDEX IF EXISTS idx_members_group_id;
      DROP INDEX IF EXISTS idx_groups_created_by;
      DROP INDEX IF EXISTS idx_users_email;
      DROP TABLE IF EXISTS settlements;
      DROP TABLE IF EXISTS expense_splits;
      DROP TABLE IF EXISTS expenses;
      DROP TABLE IF EXISTS members;
      DROP TABLE IF EXISTS groups;
      DROP TABLE IF EXISTS users;
    `);
  },
};

/**
 * Migration 2: Add activity tracking
 * - activities table for audit trail
 */
const migration2: Migration = {
  version: 2,
  name: 'add_activity_tracking',
  up: (db: Database.Database) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_activities_group_id ON activities(group_id);
      CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
    `);
  },
  down: (db: Database.Database) => {
    db.exec(`
      DROP INDEX IF EXISTS idx_activities_created_at;
      DROP INDEX IF EXISTS idx_activities_user_id;
      DROP INDEX IF EXISTS idx_activities_group_id;
      DROP TABLE IF EXISTS activities;
    `);
  },
};

/**
 * Migration 3: Add notifications
 * - notifications table for user notifications
 */
const migration3: Migration = {
  version: 3,
  name: 'add_notifications',
  up: (db: Database.Database) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `);
  },
  down: (db: Database.Database) => {
    db.exec(`
      DROP INDEX IF EXISTS idx_notifications_created_at;
      DROP INDEX IF EXISTS idx_notifications_read;
      DROP INDEX IF EXISTS idx_notifications_user_id;
      DROP TABLE IF EXISTS notifications;
    `);
  },
};

// All migrations in order
const migrations: Migration[] = [migration1, migration2, migration3];

/**
 * Get current migration version from database
 */
function getCurrentVersion(db: Database.Database): number {
  const result = db
    .prepare('PRAGMA user_version')
    .get() as { user_version: number };
  return result.user_version;
}

/**
 * Set migration version in database
 */
function setCurrentVersion(db: Database.Database, version: number): void {
  db.pragma(`user_version = ${version}`);
}

/**
 * Run all pending migrations
 */
export function runMigrations(db: Database.Database): void {
  const currentVersion = getCurrentVersion(db);
  console.log(`Current database version: ${currentVersion}`);

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(
        `Running migration ${migration.version}: ${migration.name}`
      );
      migration.up(db);
      setCurrentVersion(db, migration.version);
      console.log(`Migration ${migration.version} completed`);
    }
  }

  const finalVersion = getCurrentVersion(db);
  if (finalVersion > currentVersion) {
    console.log(
      `Database migrated from version ${currentVersion} to ${finalVersion}`
    );
  } else if (currentVersion === 0) {
    console.log('Database initialized with latest schema');
  } else {
    console.log('Database is up to date');
  }
}

/**
 * Rollback to a specific migration version
 */
export function rollbackMigration(
  db: Database.Database,
  targetVersion: number
): void {
  const currentVersion = getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('Cannot rollback forward or to current version');
    return;
  }

  // Rollback migrations in reverse order
  const migrationsToRollback = migrations
    .filter((m) => m.version > targetVersion && m.version <= currentVersion)
    .sort((a, b) => b.version - a.version);

  for (const migration of migrationsToRollback) {
    console.log(
      `Rolling back migration ${migration.version}: ${migration.name}`
    );
    migration.down(db);
    setCurrentVersion(db, migration.version - 1);
    console.log(`Rollback ${migration.version} completed`);
  }

  console.log(
    `Database rolled back from version ${currentVersion} to ${targetVersion}`
  );
}

/**
 * Get all available migrations
 */
export function getMigrations(): Migration[] {
  return migrations;
}
