import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface DatabaseConnection {
  db: Database.Database;
  close: () => void;
  isConnected: () => boolean;
}

class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private connection: DatabaseConnection | null = null;
  private dbPath: string;

  private constructor() {
    // Determine database path
    const dataDir = path.join(process.cwd(), 'data');
    this.dbPath = path.join(dataDir, 'expenses.db');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getConnection(): DatabaseConnection {
    if (this.connection && this.connection.isConnected()) {
      return this.connection;
    }

    const db = new Database(this.dbPath);

    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    this.connection = {
      db,
      close: () => {
        if (this.connection) {
          this.connection.db.close();
          this.connection = null;
        }
      },
      isConnected: () => {
        try {
          this.connection?.db.pragma('cache_size');
          return true;
        } catch {
          return false;
        }
      }
    };

    return this.connection;
  }

  public closeConnection(): void {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  public getDbPath(): string {
    return this.dbPath;
  }
}

export function getDatabase(): Database.Database {
  const manager = DatabaseManager.getInstance();
  return manager.getConnection().db;
}

export function closeDatabase(): void {
  const manager = DatabaseManager.getInstance();
  manager.closeConnection();
}

export default DatabaseManager;
