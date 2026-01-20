import Database from 'better-sqlite3';
import { initializeSchema } from './schema';

export interface Migration {
  name: string;
  version: number;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  {
    name: 'initial_schema',
    version: 1,
    up: (db) => {
      initializeSchema(db);
    },
    down: (db) => {
      db.exec(`
        DROP INDEX IF EXISTS idx_settlements_to_user;
        DROP INDEX IF EXISTS idx_settlements_from_user;
        DROP INDEX IF EXISTS idx_settlements_group_id;
        DROP INDEX IF EXISTS idx_expense_splits_expense_id;
        DROP INDEX IF EXISTS idx_expenses_paid_by;
        DROP INDEX IF EXISTS idx_expenses_group_id;
        DROP INDEX IF EXISTS idx_group_members_user_id;
        DROP INDEX IF EXISTS idx_group_members_group_id;
        DROP INDEX IF EXISTS idx_groups_created_by;
        DROP TABLE IF EXISTS settlements;
        DROP TABLE IF EXISTS expense_splits;
        DROP TABLE IF EXISTS expenses;
        DROP TABLE IF EXISTS group_members;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS users;
      `);
    },
  },
  {
    name: 'add_expense_categories_index',
    version: 2,
    up: (db) => {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      `);
    },
    down: (db) => {
      db.exec(`
        DROP INDEX IF EXISTS idx_expenses_category;
        DROP INDEX IF EXISTS idx_expenses_date;
      `);
    },
  },
  {
    name: 'add_settlements_status_index',
    version: 3,
    up: (db) => {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
      `);
    },
    down: (db) => {
      db.exec(`
        DROP INDEX IF EXISTS idx_settlements_status;
      `);
    },
  },
];

export class MigrationManager {
  constructor(private db: Database.Database) {
    this.initializeMigrationsTable();
  }

  private initializeMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        applied_at INTEGER NOT NULL
      );
    `);
  }

  private getCurrentVersion(): number {
    const stmt = this.db.prepare('SELECT MAX(version) as version FROM _migrations');
    const result = stmt.get() as { version: number | null };
    return result.version || 0;
  }

  private recordMigration(migration: Migration): void {
    const stmt = this.db.prepare('INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)');
    stmt.run(migration.version, migration.name, Date.now());
  }

  private removeMigration(version: number): void {
    const stmt = this.db.prepare('DELETE FROM _migrations WHERE version = ?');
    stmt.run(version);
  }

  async migrate(): Promise<void> {
    const currentVersion = this.getCurrentVersion();
    const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      console.log('Database is up to date');
      return;
    });

    console.log(`Running ${pendingMigrations.length} migration(s)...`);

    // Run migrations in a transaction
    const migrate = this.db.transaction(() => {
      for (const migration of pendingMigrations) {
        console.log(`Applying migration: ${migration.name}`);
        migration.up(this.db);
        this.recordMigration(migration);
        console.log(`✓ Migration ${migration.name} applied`);
      }
    });

    migrate();
    console.log('All migrations completed successfully');
  }

  async rollback(targetVersion: number): Promise<void> {
    const currentVersion = this.getCurrentVersion();
    if (targetVersion >= currentVersion) {
      console.log('Nothing to rollback');
      return;
    }

    const migrationsToRollback = migrations
      .filter((m) => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version); // Rollback in reverse order

    if (migrationsToRollback.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    console.log(`Rolling back ${migrationsToRollback.length} migration(s)...`);

    const rollback = this.db.transaction(() => {
      for (const migration of migrationsToRollback) {
        if (!migration.down) {
          console.log(`⚠ Migration ${migration.name} cannot be rolled back`);
          continue;
        }
        console.log(`Rolling back migration: ${migration.name}`);
        migration.down(this.db);
        this.removeMigration(migration.version);
        console.log(`✓ Migration ${migration.name} rolled back`);
      }
    });

    rollback();
    console.log('Rollback completed successfully');
  }

  getMigrationHistory(): Array<{ version: number; name: string; applied_at: number }> {
    const stmt = this.db.prepare('SELECT version, name, applied_at FROM _migrations ORDER BY version ASC');
    return stmt.all() as Array<{ version: number; name: string; applied_at: number }>;
  }

  getStatus(): { currentVersion: number; latestVersion: number; pending: number } {
    const currentVersion = this.getCurrentVersion();
    const latestVersion = Math.max(...migrations.map((m) => m.version));
    const pending = migrations.filter((m) => m.version > currentVersion).length;

    return {
      currentVersion,
      latestVersion,
      pending,
    };
  }
}
