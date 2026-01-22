import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

/**
 * Initialize and export the database connection
 * This uses better-sqlite3 with Drizzle ORM for type-safe database operations
 */

const databaseUrl = process.env.DATABASE_URL ?? 'file:./data/splitsync.db';

// Create database directory if it doesn't exist
if (databaseUrl.startsWith('file:')) {
  const dbPath = databaseUrl.replace('file:', '');
  const fs = require('fs');
  const path = require('path');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Initialize SQLite database
const sqlite = new Database(databaseUrl);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Set WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');

// Create Drizzle database instance
export const db = drizzle(sqlite);

// Export the raw sqlite connection for direct queries if needed
export { sqlite };

/**
 * Close the database connection gracefully
 * Call this when shutting down the application
 */
export function closeDatabase(): void {
  sqlite.close();
}
