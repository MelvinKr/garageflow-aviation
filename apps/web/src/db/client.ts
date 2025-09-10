import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  const client = new Client({ connectionString: url, keepAlive: true, ssl: { rejectUnauthorized: false } });
  // important: connexion au runtime serveur (server actions / RSC)
  // @ts-ignore
  client.connect();
  _db = drizzle(client);
  return _db!;
}
