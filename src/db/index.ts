import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create database directory if it doesn't exist
const dbPath = process.env.DATABASE_URL || 'file:./data/splitsync.db';
const dbPathClean = dbPath.replace('file:', '');

// Initialize SQLite database
const sqlite = new Database(dbPathClean);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Set performance optimizations
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = -64000'); // 64MB cache
sqlite.pragma('temp_store = MEMORY');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for use in migrations and queries
export * from './schema';

// Database connection helper
export async function getDb() {
  return db;
}

// Health check function
export async function checkDbConnection(): Promise<boolean> {
  try {
    const result = sqlite.prepare('SELECT 1 as health').get() as { health: number };
    return result.health === 1;
  } catch {
    return false;
  }
}

// Close database connection (for cleanup)
export function closeDb(): void {
  sqlite.close();
}
