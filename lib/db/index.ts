import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

/**
 * Get the database path based on environment
 */
function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL || "file:././data/splitsync.db";

  // Remove the file: prefix if present
  if (dbUrl.startsWith("file:")) {
    const dbPath = dbUrl.slice(5);
    return path.resolve(process.cwd(), dbPath);
  }

  return dbUrl;
}

/**
 * Create and configure the SQLite database connection
 */
export function createDatabase() {
  const dbPath = getDatabasePath();

  const sqlite = new Database(dbPath);

  // Enable WAL mode for better concurrent access
  sqlite.pragma("journal_mode = WAL");

  // Enable foreign keys
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  return { db, sqlite };
}

// Global database instance singleton
let globalDb: ReturnType<typeof createDatabase> | null = null;

/**
 * Get the global database instance
 */
export function getDatabase() {
  if (!globalDb) {
    globalDb = createDatabase();
  }
  return globalDb;
}

/**
 * Close the database connection
 */
export async function closeDatabase() {
  if (globalDb) {
    globalDb.sqlite.close();
    globalDb = null;
  }
}

// Export the database instance
export const { db } = getDatabase();

// Export schema for use in other files
export * from "./schema";
