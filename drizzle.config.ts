import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema/*",
  out: "./lib/db/migrations",
  dialect: "sqlite",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./data/splitsync.db",
  },
  verbose: true,
  strict: true,
} satisfies Config;
