import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './prisma/drizzle',
  dialect: 'sqlite',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;
