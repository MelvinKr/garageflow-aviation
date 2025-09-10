import 'dotenv/config';
import { getDb } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();

  // parts
  await db.execute(sql`
    INSERT INTO "parts" ("part_number","name","on_hand","min_stock")
    VALUES 
    ('A320-BRK-001','Brake Pad A320',50,10),
    ('B737-FLTR-014','Fuel Filter 737',30,8),
    ('ATR72-OIL-002','Oil Cartridge ATR72',80,20)
    ON CONFLICT ("part_number") DO NOTHING;
  `);

  // movements (example inbound)
  await db.execute(sql`
    INSERT INTO "movements" ("part_id","type","quantity","note")
    SELECT id, 'RECEIVE', 10, 'Initial stock load'
    FROM "parts" WHERE "part_number"='A320-BRK-001';
  `);

  console.log('✅ Seed done');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

