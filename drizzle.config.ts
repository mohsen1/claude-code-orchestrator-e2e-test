import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config();

export default {
  schema: './lib/db/schema/*',
  out: './lib/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './data/splitsync.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;
