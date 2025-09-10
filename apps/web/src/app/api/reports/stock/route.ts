import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.execute(sql`
      with months as (
        select to_char(date_trunc('month', now()) - (n || ' months')::interval, 'YYYY-MM') as ym
        from generate_series(0,11) as t(n)
        order by ym
      )
      select p.sku as "partNumber",
             p.name,
             coalesce(p.qty, 0)::int as "onHand",
             coalesce(p.min_qty, 0)::int as "minStock",
             array(
               select coalesce(sum(case when m.type = 'OUT' then m.qty else 0 end),0)::int
               from months mo
               left join movements m on m.part_id = p.id
                 and to_char(date_trunc('month', m.at), 'YYYY-MM') = mo.ym
               group by mo.ym
               order by mo.ym
             ) as "monthlyConsumption"
      from parts p
      order by p.sku
      limit 200;
    `);
    // @ts-ignore drizzle returns { rows }
    return NextResponse.json(rows.rows ?? rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}

