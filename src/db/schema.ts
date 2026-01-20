// Database schema initialization and migration utilities

import Database from 'better-sqlite3';

export function initializeSchema(db: Database.Database): void {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      avatar_url TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create group_members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount >= 0),
      paid_by INTEGER NOT NULL,
      category TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (paid_by) REFERENCES users(id)
    )
  `);

  // Create expense_splits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expense_splits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL CHECK(amount >= 0),
      share_type TEXT NOT NULL CHECK(share_type IN ('equal', 'exact', 'percentage')),
      UNIQUE(expense_id, user_id),
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create settlements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      amount REAL NOT NULL CHECK(amount >= 0),
      method TEXT,
      notes TEXT,
      settled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

    CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

    CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

    CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
    CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);

    CREATE INDEX IF NOT EXISTS idx_settlements_group_id ON settlements(group_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_from_user_id ON settlements(from_user_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_to_user_id ON settlements(to_user_id);
  `);
}

export function dropAllTables(db: Database.Database): void {
  // Drop tables in reverse order of dependencies
  db.exec(`
    DROP INDEX IF EXISTS idx_settlements_to_user_id;
    DROP INDEX IF EXISTS idx_settlements_from_user_id;
    DROP INDEX IF EXISTS idx_settlements_group_id;

    DROP INDEX IF EXISTS idx_expense_splits_user_id;
    DROP INDEX IF EXISTS idx_expense_splits_expense_id;

    DROP INDEX IF EXISTS idx_expenses_category;
    DROP INDEX IF EXISTS idx_expenses_date;
    DROP INDEX IF EXISTS idx_expenses_paid_by;
    DROP INDEX IF EXISTS idx_expenses_group_id;

    DROP INDEX IF EXISTS idx_group_members_user_id;
    DROP INDEX IF EXISTS idx_group_members_group_id;

    DROP INDEX IF EXISTS idx_users_google_id;
    DROP INDEX IF EXISTS idx_users_email;

    DROP TABLE IF EXISTS settlements;
    DROP TABLE IF EXISTS expense_splits;
    DROP TABLE IF EXISTS expenses;
    DROP TABLE IF EXISTS group_members;
    DROP TABLE IF EXISTS groups;
    DROP TABLE IF EXISTS users;
  `);
}

export function resetDatabase(db: Database.Database): void {
  dropAllTables(db);
  initializeSchema(db);
}

export function createDatabaseWithPath(filePath: string): Database.Database {
  const db = new Database(filePath);
  initializeSchema(db);
  return db;
}

export function createInMemoryDatabase(): Database.Database {
  const db = new Database(':memory:');
  initializeSchema(db);
  return db;
}

// Migration utilities
export function backupDatabase(db: Database.Database, backupPath: string): void {
  db.backup(backupPath).step(-1);
}

export function getDatabaseInfo(db: Database.Database): {
  version: string;
  tables: string[];
  indexes: string[];
} {
  const version = db.pragma('user_version', { simple: true });

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all() as { name: string }[];

  const indexes = db
    .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name")
    .all() as { name: string }[];

  return {
    version: String(version),
    tables: tables.map(t => t.name),
    indexes: indexes.map(i => i.name)
  };
}

export function vacuumDatabase(db: Database.Database): void {
  db.pragma('optimize');
}

export function getDatabaseSize(db: Database.Database): number {
  const result = db
    .prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()')
    .get() as { size: number };
  return result.size;
}
