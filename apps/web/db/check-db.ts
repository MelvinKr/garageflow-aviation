import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

async function main() {
  try {
    const client = postgres(process.env.DATABASE_URL!, { max: 1 });
    const db = drizzle(client);

    const result = await db.execute("select now()");
    console.log("✅ Connexion OK →", result);
  } catch (e) {
    console.error("❌ Connexion FAIL →", e);
  } finally {
    process.exit(0);
  }
}

main();

