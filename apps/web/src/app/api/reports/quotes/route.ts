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
      select mo.ym as month,
             count(q.id)::int as count,
             0::float as total,
             coalesce(avg(case when q.status = 'accepted' then 1.0 else 0.0 end),0)::float as "conversionRate"
      from months mo
      left join quotes q
        on to_char(date_trunc('month', q.created_at),'YYYY-MM') = mo.ym
      group by mo.ym
      order by mo.ym;
    `);
    // @ts-ignore
    return NextResponse.json(rows.rows ?? rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}

