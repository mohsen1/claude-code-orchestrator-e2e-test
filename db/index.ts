import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import fs from "fs";

// Create database directory if it doesn't exist
const dbDir = process.env.DATABASE_URL?.replace("file:", "").replace(/\/[^/]*$/, "") || "./db";
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite connection
const sqlite = new Database(
  process.env.DATABASE_URL?.replace("file:", "") || "./db/splitsync.sqlite"
);

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });
