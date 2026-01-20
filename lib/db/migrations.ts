import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { initializeDatabase } from './schema';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'expenses.db');
const migrationsDir = path.join(dataDir, 'migrations');

// Ensure data directory exists
export function ensureDataDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
  }

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('Created migrations directory:', migrationsDir);
  }
}

// Initialize database with schema
export function setupDatabase() {
  ensureDataDirectory();

  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Run initial schema
  initializeDatabase();

  console.log('Database setup complete');

  return db;
}

// Run migrations
export function runMigrations() {
  ensureDataDirectory();

  const db = new Database(dbPath);

  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get executed migrations
  const executedMigrations = db
    .prepare('SELECT name FROM _migrations')
    .all()
    .map((row: any) => row.name);

  // Read migration files
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.sql');

      if (!executedMigrations.includes(migrationName)) {
        console.log(`Running migration: ${migrationName}`);

        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        try {
          db.exec(migrationSQL);

          // Record migration
          db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(
            migrationName
          );

          console.log(`Migration ${migrationName} completed successfully`);
        } catch (error) {
          console.error(`Migration ${migrationName} failed:`, error);
          throw error;
        }
      }
    }
  }

  console.log('All migrations completed');

  return db;
}

// Create a new migration file
export function createMigration(name: string) {
  ensureDataDirectory();

  const timestamp = Date.now();
  const filename = `${timestamp}-${name}.sql`;
  const filepath = path.join(migrationsDir, filename);

  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Write your SQL migration here

`;

  fs.writeFileSync(filepath, template);
  console.log(`Created migration file: ${filename}`);

  return filepath;
}

// Backup database
export function backupDatabase() {
  ensureDataDirectory();

  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file does not exist');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(dataDir, `backup-${timestamp}.db`);

  fs.copyFileSync(dbPath, backupPath);
  console.log(`Database backed up to: ${backupPath}`);

  return backupPath;
}

// Get database info
export function getDatabaseInfo() {
  ensureDataDirectory();

  const dbExists = fs.existsSync(dbPath);

  if (!dbExists) {
    return {
      exists: false,
      path: dbPath,
      size: 0,
    };
  }

  const stats = fs.statSync(dbPath);

  const db = new Database(dbPath);

  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_migrations'"
    )
    .all();

  const tableCounts: Record<string, number> = {};

  tables.forEach((table: any) => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as any;
    tableCounts[table.name] = count.count;
  });

  const migrations = db.prepare('SELECT COUNT(*) as count FROM _migrations').get() as any;

  db.close();

  return {
    exists: true,
    path: dbPath,
    size: stats.size,
    tables: tableCounts,
    migrationsExecuted: migrations.count,
  };
}

// Reset database (WARNING: This will delete all data)
export function resetDatabase() {
  ensureDataDirectory();

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Database deleted');
  }

  setupDatabase();
  console.log('Database reset complete');
}

export default {
  ensureDataDirectory,
  setupDatabase,
  runMigrations,
  createMigration,
  backupDatabase,
  getDatabaseInfo,
  resetDatabase,
};
