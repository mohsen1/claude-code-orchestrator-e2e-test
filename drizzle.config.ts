import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  strict: true,
  verbose: true,
  introspect: {
    connectionString: process.env.DATABASE_URL || 'file:./dev.db',
  },
} satisfies Config;
