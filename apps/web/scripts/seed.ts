import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../src/db/schema";
import parts from "../src/mock/parts.json";
import suppliers from "../src/mock/suppliers.json";
import customers from "../src/mock/customers.json";
import aircraft from "../src/mock/aircraft.json";
import quotes from "../src/mock/quotes.json";
import workorders from "../src/mock/workorders.json";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });

  await client.query("BEGIN");
  try {
    await client.query(
      `TRUNCATE TABLE po_items, purchase_orders, movements, wo_tasks, workorders, quote_items, quotes, aircraft, customers, parts, suppliers RESTART IDENTITY CASCADE`
    );

    await db.insert(schema.suppliers).values(suppliers as any);
    await db.insert(schema.customers).values(customers as any);
    await db.insert(schema.aircraft).values(aircraft as any);
    await db.insert(schema.parts).values(parts as any);

    await db.insert(schema.quotes).values(
      (quotes as any[]).map((q: any) => ({
        id: q.id,
        customerId: q.customerId,
        aircraftId: q.aircraftId,
        status: q.status,
        discountPct: q.discountPct ?? 0,
        createdAt: new Date(q.createdAt),
      }))
    );
    const qItems = (quotes as any[]).flatMap((q: any) => q.items.map((i: any) => ({ ...i, quoteId: q.id })));
    await db.insert(schema.quoteItems).values(qItems as any);

    await db.insert(schema.workorders).values(
      (workorders as any[]).map((w: any) => ({
        id: w.id,
        quoteId: w.quoteId ?? null,
        aircraftId: w.aircraftId,
        status: w.status,
        openedAt: new Date(w.openedAt),
        closedAt: w.closedAt ? new Date(w.closedAt) : null,
        notes: null,
      }))
    );
    const wTasks = (workorders as any[]).flatMap((w: any) => w.tasks.map((t: any) => ({ ...t, woId: w.id })));
    await db.insert(schema.woTasks).values(wTasks as any);

    await client.query("COMMIT");
    console.log("✅ Seed OK");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
  } finally {
    await client.end();
  }
}

main();

