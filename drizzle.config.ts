import type { Config } from "drizzle-kit";

export default {
  schema: "./apps/web/db/schema.ts",
  out: "./apps/web/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;

