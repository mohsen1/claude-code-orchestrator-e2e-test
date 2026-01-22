import type { Config } from 'drizzle-kit';

/**
 * Drizzle ORM Kit Configuration
 * @see https://orm.drizzle.team/docs/kit-overview
 */
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./data/db/splitsync.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;
