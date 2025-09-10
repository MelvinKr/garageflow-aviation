import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./drizzle/schema.ts", // adapte si besoin
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    // 👇 Drizzle Kit transmettra ceci à node-postgres
    ssl: { rejectUnauthorized: false },
  },
});
