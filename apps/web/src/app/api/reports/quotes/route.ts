import { NextResponse } from "next/server";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const months = Math.max(1, Math.min(24, Number(searchParams.get("months") ?? 12)));
    const db = getDb();
    const q = `
      with months as (
        select to_char(date_trunc('month', now()) - (n || ' months')::interval, 'YYYY-MM') as ym
        from generate_series(0, ${months - 1}) as t(n)
        order by ym
      )
      select mo.ym as month,
             count(q.id)::int as count,
             coalesce(sum(q.total_amount),0)::float as total,
             coalesce(avg(case when q.status = 'ACCEPTED' then 1.0 else 0.0 end),0)::float as "conversionRate"
      from months mo
      left join quotes q
        on to_char(date_trunc('month', q.created_at),'YYYY-MM') = mo.ym
      group by mo.ym
      order by mo.ym;`;
    const res: any = await db.execute(q as any);
    return NextResponse.json(res.rows ?? res);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}
