import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeSchema } from './schema';
import { MigrationRunner } from './migrations/migration_runner';

export class DatabaseClient {
  private db: Database.Database;
  private migrationRunner: MigrationRunner;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.migrationRunner = new MigrationRunner(this.db, path.join(__dirname, 'migrations'));

    this.configure();
  }

  private configure(): void {
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('synchronous = NORMAL');
  }

  async initialize(runMigrations: boolean = true): Promise<void> {
    this.migrationRunner.createMigrationsTable();

    if (runMigrations) {
      await this.migrationRunner.migrate();
    } else {
      initializeSchema(this.db);
    }
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  getMigrationRunner(): MigrationRunner {
    return this.migrationRunner;
  }

  close(): void {
    this.db.close();
  }

  transaction<T>(fn: (db: Database.Database) => T): T {
    return this.db.transaction(fn)(this.db);
  }

  backup(backupPath: string): void {
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    this.db.backup(backupPath).then(() => {
      console.log(`Backup created at ${backupPath}`);
    });
  }

  static fromMemory(): DatabaseClient {
    const client = new DatabaseClient(':memory:');
    return client;
  }
}

let dbClient: DatabaseClient | null = null;

export function getDatabaseClient(dbPath?: string): DatabaseClient {
  if (!dbClient) {
    const defaultPath = path.join(process.cwd(), 'data', 'expense-sharing.db');
    dbClient = new DatabaseClient(dbPath || defaultPath);
  }

  return dbClient;
}

export function closeDatabaseClient(): void {
  if (dbClient) {
    dbClient.close();
    dbClient = null;
  }
}

export async function initializeDatabase(
  dbPath?: string,
  runMigrations: boolean = true
): Promise<DatabaseClient> {
  const client = getDatabaseClient(dbPath);
  await client.initialize(runMigrations);
  return client;
}
