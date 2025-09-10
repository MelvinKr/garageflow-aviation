import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./apps/web/db/schema.ts",
  out: "./apps/web/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
