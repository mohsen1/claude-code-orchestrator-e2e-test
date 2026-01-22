import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Create database connection
const connectionString = process.env.DATABASE_URL || 'file:./dev.db';

// Parse the connection string to get the file path
const dbPath = connectionString.replace('file:', '');

// Initialize SQLite database
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for use in other files
export * from './schema';
