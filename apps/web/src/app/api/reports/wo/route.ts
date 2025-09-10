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
             count(case when to_char(date_trunc('month', w.created_at),'YYYY-MM') = mo.ym then 1 end)::int as opened,
             count(case when w.closed_at is not null and to_char(date_trunc('month', w.closed_at),'YYYY-MM') = mo.ym then 1 end)::int as closed,
             coalesce(avg(case when w.closed_at is not null then extract(day from (w.closed_at - w.created_at)) end),0)::float as "avgCycleDays"
      from months mo
      left join work_orders w on (
        to_char(date_trunc('month', w.created_at),'YYYY-MM') = mo.ym
        or (w.closed_at is not null and to_char(date_trunc('month', w.closed_at),'YYYY-MM') = mo.ym)
      )
      group by mo.ym
      order by mo.ym;`;
    const res: any = await db.execute(q as any);
    return NextResponse.json(res.rows ?? res);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}
