import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:././data/splitsync.db",
  },
  verbose: true,
  strict: true,
} satisfies Config;
