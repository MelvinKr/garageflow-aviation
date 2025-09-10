import "dotenv/config";
import { db } from "@/lib/db";
import { parts, movements, quotes, workOrders } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  // Parts
  const existing: any = await db.execute(sql`SELECT id FROM parts LIMIT 1;`);
  if (!existing?.rows?.length) {
    await db.insert(parts).values([
      { partNumber: "P-0001", name: "Filtre à huile IO-540", onHand: 12, minStock: 5 },
      { partNumber: "P-0002", name: "Bougie aviation REM37BY", onHand: 40, minStock: 20 },
      { partNumber: "CLEV-66-105", name: "Plaquette de frein (Cessna)", onHand: 2, minStock: 6 },
    ]);
  }

  // Movements: 12 months consumption
  const partsRows: any = await db.execute(sql`SELECT id, part_number FROM parts ORDER BY id;`);
  const now = new Date();
  for (const p of partsRows.rows as any[]) {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 8));
      const qty = 3 + ((i * ((p.id % 5) + 1)) % 7);
      await db.insert(movements).values({
        partId: p.id,
        type: "CONSUME" as any,
        quantity: qty,
        createdAt: d as any,
        note: `auto seed M-${i}`,
      });
    }
  }

  // Quotes: 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 10));
    const count = 6 + (i % 5);
    const total = 10000 + i * 950;
    const acceptedRatio = 0.4 + ((i % 4) * 0.05);
    for (let k = 0; k < count; k++) {
      const status = Math.random() < acceptedRatio ? "ACCEPTED" : (Math.random() < 0.5 ? "SENT" : "REJECTED");
      await db.insert(quotes).values({
        status: status as any,
        totalAmount: total / count,
        createdAt: d as any,
        updatedAt: d as any,
      });
    }
  }

  // Work Orders: 12 months
  for (let i = 11; i >= 0; i--) {
    const opened = 4 + (i % 4);
    for (let k = 0; k < opened; k++) {
      const created = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 5 + k));
      const closed = Math.random() < 0.7 ? new Date(created.getTime() + (3 + Math.floor(Math.random() * 10)) * 86400000) : null;
      await db.insert(workOrders).values({
        createdAt: created as any,
        closedAt: closed as any,
      });
    }
  }

  console.log("Seed OK ✅");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
