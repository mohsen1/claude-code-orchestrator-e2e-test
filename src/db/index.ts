import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Create data directory if it doesn't exist
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const sqlite = new Database(path.join(dataDir, 'splitsync.db'));
sqlite.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency

// Create Drizzle instance
export const db = drizzle(sqlite);

// Export database instance for raw queries if needed
export { sqlite };
