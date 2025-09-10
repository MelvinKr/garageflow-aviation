import "dotenv/config";
import type { Config } from "drizzle-kit";

const u = new URL(process.env.DATABASE_URL!);

export default {
  dialect: "postgresql",
  schema: "./apps/web/db/schema.ts",
  out: "./apps/web/db/migrations",
  dbCredentials: {
    host: u.hostname,
    port: Number(u.port || 5432),
    database: u.pathname.replace(/^\//, ""),
    user: u.username || "postgres",
    password: u.password,
    ssl: "require",
  },
  verbose: true,
  strict: true,
} satisfies Config;
