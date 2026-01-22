import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Test database setup
let testDb: Database.Database;
let testDbUrl: string;

beforeAll(async () => {
  // Create an in-memory database for integration tests
  testDb = new Database(':memory:');
  testDbUrl = 'file::memory:';

  // Enable foreign keys
  testDb.pragma('foreign_keys = ON');

  // Run migrations
  const db = drizzle(testDb);
  // Uncomment when migrations are created
  // await migrate(db, { migrationsFolder: './lib/db/migrations' });

  console.log('Integration test database initialized');
});

afterAll(async () => {
  // Close database connection
  if (testDb) {
    testDb.close();
  }
  console.log('Integration test database closed');
});

beforeEach(() => {
  // Reset mocks before each test
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
});

// Export test database for use in integration tests
export { testDb, testDbUrl };

// Helper function to get a fresh database instance for each test
export function getTestDb() {
  return drizzle(testDb);
}

// Clean database helper
export function cleanDatabase() {
  if (testDb) {
    // Delete all data from tables
    const tables = testDb
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      )
      .all() as { name: string }[];

    tables.forEach((table) => {
      testDb.prepare(`DELETE FROM ${table.name}`).run();
    });
  }
}

// Seed database helper
export function seedDatabase() {
  // Add common test data here
  // This will be populated when we have actual schema
  console.log('Seeding database with test data');
}
