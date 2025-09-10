import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");

  // Use a Pool for better resilience and reconnection
  _pool = new Pool({
    connectionString: url,
    keepAlive: true,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  _pool.on("error", (err) => {
    console.error("PG pool error:", err);
  });

  _db = drizzle(_pool);
  return _db!;
}
