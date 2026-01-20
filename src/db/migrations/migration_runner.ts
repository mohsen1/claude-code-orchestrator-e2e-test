import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

export class MigrationRunner {
  private db: Database.Database;
  private migrationsDir: string;

  constructor(db: Database.Database, migrationsDir: string) {
    this.db = db;
    this.migrationsDir = migrationsDir;
  }

  async loadMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];

    try {
      const files = fs.readdirSync(this.migrationsDir);
      const migrationFiles = files
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
        .sort();

      for (const file of migrationFiles) {
        const filePath = path.join(this.migrationsDir, file);

        delete require.cache[require.resolve(filePath)];

        const migrationModule = require(filePath);

        if (migrationModule.version && migrationModule.up && migrationModule.down) {
          migrations.push({
            version: migrationModule.version,
            name: migrationModule.name || file,
            up: migrationModule.up,
            down: migrationModule.down,
          });
        }
      }
    } catch (error) {
      console.error('Error loading migrations:', error);
    }

    return migrations.sort((a, b) => a.version - b.version);
  }

  getCurrentVersion(): number {
    const row = this.db
      .prepare('SELECT MAX(version) as version FROM schema_migrations')
      .get() as { version: number | null };

    return row?.version ?? 0;
  }

  async migrate(targetVersion?: number): Promise<void> {
    const migrations = await this.loadMigrations();
    const currentVersion = this.getCurrentVersion();

    const latestVersion = migrations[migrations.length - 1]?.version ?? 0;
    const finalTargetVersion = targetVersion ?? latestVersion;

    if (finalTargetVersion > latestVersion) {
      throw new Error(
        `Target version ${finalTargetVersion} is greater than latest version ${latestVersion}`
      );
    }

    if (finalTargetVersion === currentVersion) {
      console.log(`Already at version ${currentVersion}`);
      return;
    }

    this.db.exec('BEGIN TRANSACTION');

    try {
      if (finalTargetVersion > currentVersion) {
        await this.runMigrations(migrations, currentVersion, finalTargetVersion, 'up');
      } else {
        await this.runMigrations(migrations, currentVersion, finalTargetVersion, 'down');
      }

      this.db.exec('COMMIT');
      console.log(`Migration complete: version ${currentVersion} → ${finalTargetVersion}`);
    } catch (error) {
      this.db.exec('ROLLBACK');
      console.error('Migration failed, rolled back:', error);
      throw error;
    }
  }

  private async runMigrations(
    migrations: Migration[],
    fromVersion: number,
    toVersion: number,
    direction: 'up' | 'down'
  ): Promise<void> {
    const migrationsToRun =
      direction === 'up'
        ? migrations.filter((m) => m.version > fromVersion && m.version <= toVersion)
        : migrations
            .filter((m) => m.version <= fromVersion && m.version > toVersion)
            .sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRun) {
      console.log(`Running migration ${migration.version}: ${migration.name} (${direction})`);

      if (direction === 'up') {
        migration.up(this.db);
        this.recordMigration(migration.version);
      } else {
        migration.down(this.db);
        this.removeMigration(migration.version);
      }
    }
  }

  private recordMigration(version: number): void {
    const stmt = this.db.prepare(
      'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)'
    );
    stmt.run(version, Math.floor(Date.now() / 1000));
  }

  private removeMigration(version: number): void {
    const stmt = this.db.prepare('DELETE FROM schema_migrations WHERE version = ?');
    stmt.run(version);
  }

  async rollback(steps: number = 1): Promise<void> {
    const currentVersion = this.getCurrentVersion();
    const targetVersion = Math.max(0, currentVersion - steps);

    await this.migrate(targetVersion);
  }

  getMigrationHistory(): Array<{ version: number; applied_at: number }> {
    const rows = this.db
      .prepare('SELECT version, applied_at FROM schema_migrations ORDER BY version ASC')
      .all() as Array<{ version: number; applied_at: number }>;

    return rows;
  }

  async status(): Promise<{
    current: number;
    latest: number;
    pending: Migration[];
  }> {
    const migrations = await this.loadMigrations();
    const currentVersion = this.getCurrentVersion();
    const latestVersion = migrations[migrations.length - 1]?.version ?? 0;
    const pending = migrations.filter((m) => m.version > currentVersion);

    return {
      current: currentVersion,
      latest: latestVersion,
      pending,
    };
  }

  reset(): void {
    this.db.exec('BEGIN TRANSACTION');

    try {
      const migrations = this.loadMigrationsSync();

      for (let i = migrations.length - 1; i >= 0; i--) {
        const migration = migrations[i];
        console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
        migration.down(this.db);
      }

      this.db.exec('DELETE FROM schema_migrations');
      this.db.exec('COMMIT');
      console.log('Database reset complete');
    } catch (error) {
      this.db.exec('ROLLBACK');
      console.error('Reset failed, rolled back:', error);
      throw error;
    }
  }

  private loadMigrationsSync(): Migration[] {
    const migrations: Migration[] = [];

    try {
      const files = fs.readdirSync(this.migrationsDir);
      const migrationFiles = files
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
        .sort();

      for (const file of migrationFiles) {
        const filePath = path.join(this.migrationsDir, file);
        const migrationModule = require(filePath);

        if (migrationModule.version && migrationModule.up && migrationModule.down) {
          migrations.push({
            version: migrationModule.version,
            name: migrationModule.name || file,
            up: migrationModule.up,
            down: migrationModule.down,
          });
        }
      }
    } catch (error) {
      console.error('Error loading migrations:', error);
    }

    return migrations.sort((a, b) => a.version - b.version);
  }

  createMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );
    `);
  }
}
