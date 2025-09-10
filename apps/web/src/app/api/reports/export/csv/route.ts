import { NextResponse } from "next/server";

function toCSV(rows: any[]): string {
  if (!rows?.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = String(v ?? "");
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(";")];
  for (const r of rows) lines.push(cols.map((c) => esc((r as any)[c])).join(";"));
  return lines.join("\n");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const months = searchParams.get("months") ?? "12";
  const alpha = searchParams.get("alpha") ?? "0.5";

  const base = process.env.NEXT_PUBLIC_BASE_URL || url.origin;
  const [stock, quotes, wo] = await Promise.all([
    fetch(`${base}/api/reports/stock?months=${months}&alpha=${alpha}`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${base}/api/reports/quotes?months=${months}`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${base}/api/reports/wo?months=${months}`, { cache: "no-store" }).then((r) => r.json()),
  ]);

  const stockParts = stock.parts ?? (stock.rows ?? []).map((r: any) => ({
    partNumber: r.partNumber ?? r.sku,
    name: r.name,
    onHand: r.onHand ?? r.qty,
    minStock: r.minStock ?? r.min_qty,
    ema: r.ema ?? r.emaSeries ?? [],
    target: r.target ?? null,
    reorder: r.reorder ?? null,
  }));
  const stockRows = (stockParts as any[]).map((p) => ({
    partNumber: p.partNumber,
    name: p.name,
    onHand: p.onHand,
    target: p.target,
    reorder: p.reorder,
    lastEMA: p.ema?.[p.ema.length - 1] ?? 0,
  }));

  const sections = [
    { name: "Stock", rows: stockRows },
    { name: "Quotes", rows: quotes.items ?? quotes },
    { name: "WorkOrders", rows: wo.items ?? wo },
  ];

  const parts: string[] = [];
  for (const s of sections) {
    parts.push(`# ${s.name}`);
    parts.push(toCSV(s.rows));
    parts.push("");
  }

  const csv = parts.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reports_${months}m.csv"`,
    },
  });
}
