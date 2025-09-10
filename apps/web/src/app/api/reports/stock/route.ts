import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { computeEMA } from "@/lib/ema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const months = Math.max(1, Math.min(24, Number(searchParams.get("months") ?? 12)));
    const alpha = Math.max(0.05, Math.min(0.95, Number(searchParams.get("alpha") ?? 0.5)));

    const db = getDb();
    const q = `
      with months as (
        select to_char(date_trunc('month', now()) - (n || ' months')::interval, 'YYYY-MM') as ym
        from generate_series(0, ${months - 1}) as t(n)
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
                 and m.at >= date_trunc('month', now()) - interval '${months - 1} months'
               group by mo.ym
               order by mo.ym
             ) as "monthlyConsumption"
      from parts p
      order by p.sku
      limit 200;`;

    const res: any = await db.execute(q as any);
    const baseRows = (res.rows ?? res) as Array<{ monthlyConsumption: number[] } & Record<string, any>>;
    const rows = baseRows.map((r) => {
      const ema = computeEMA(r.monthlyConsumption ?? [], alpha);
      const lastEMA = ema.length ? ema[ema.length - 1] : 0;
      return { ...r, emaSeries: ema, lastEMA };
    });
    return NextResponse.json({ months, alpha, rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ months: 12, alpha: 0.5, rows: [] }, { status: 200 });
  }
}
