import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/test-migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.TEST_DATABASE_URL || 'file:./test.db',
  },
  strict: true,
  verbose: true,
} satisfies Config;
