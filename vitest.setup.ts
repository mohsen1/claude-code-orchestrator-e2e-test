import { beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./db/schema";

// Setup in-memory database for testing
export let db: ReturnType<typeof drizzle>;
let sqlite: Database;

beforeAll(() => {
  sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  db = drizzle(sqlite, { schema });
});

afterAll(() => {
  sqlite.close();
});
