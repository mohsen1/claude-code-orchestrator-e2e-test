import { beforeAll, afterEach, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./db/schema";

// Setup in-memory database for testing
let db: ReturnType<typeof drizzle>;

beforeAll(() => {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  db = drizzle(sqlite, { schema });
});

afterAll(() => {
  // Cleanup
});
