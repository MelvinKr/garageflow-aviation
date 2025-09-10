import { NextResponse } from "next/server";

type StockPart = { partNumber: string; name: string; onHand: number; target: number; reorder: boolean; ema: number[] };
type QuoteItem = { ym: string; count: number; total: number; conversion: number };
type WOItem = { ym: string; opened: number; closed: number; avgCycleDays: number };

export const revalidate = 30;

function pct(a: number, b: number) {
  return b === 0 ? 0 : (a - b) / b;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const months = searchParams.get("months") ?? "12";
  const alpha = searchParams.get("alpha") ?? "0.5";

  const base = process.env.NEXT_PUBLIC_BASE_URL || url.origin;
  const [stock, quotes, wo] = await Promise.all([
    fetch(`${base}/api/reports/stock?months=${months}&alpha=${alpha}`).then((r) => r.json()),
    fetch(`${base}/api/reports/quotes?months=${months}`).then((r) => r.json()),
    fetch(`${base}/api/reports/wo?months=${months}`).then((r) => r.json()),
  ]);

  const risky: StockPart[] = ((stock.parts ?? stock.rows) as StockPart[])
    .filter((p: any) => p.reorder)
    .sort((a: any, b: any) => (b.target - b.onHand) - (a.target - a.onHand))
    .slice(0, 10);

  const q = (quotes.items ?? quotes) as QuoteItem[];
  const last2 = q.slice(-2);
  const quoteTrend = last2.length === 2 ? pct(Number(last2[1].total ?? 0), Number(last2[0].total ?? 0)) : 0;
  const convAvg = q.length ? q.reduce((s, x) => s + Number(x.conversion ?? 0), 0) / q.length : 0;

  const w = (wo.items ?? wo) as WOItem[];
  const backlog = w.length ? Number((w[w.length - 1].opened ?? 0) - (w[w.length - 1].closed ?? 0)) : 0;
  const cycleAvg = w.length ? w.reduce((s, x) => s + Number(x.avgCycleDays ?? 0), 0) / w.length : 0;

  const lines: string[] = [];
  lines.push(`Période: ${months} mois — EMA α=${alpha}`);
  lines.push("");
  lines.push("🔎 Synthèse exécutive");
  lines.push(
    `• Devis: total ${q.reduce((s, x) => s + Number(x.total ?? 0), 0).toFixed(2)} € ; taux conv. moyen ${(convAvg * 100).toFixed(1)}% ; tendance dernier mois ${
      quoteTrend >= 0 ? "+" : ""
    }${(quoteTrend * 100).toFixed(1)}%.`
  );
  lines.push(`• WO: cycle moyen ${cycleAvg.toFixed(1)} j ; backlog actuel ${backlog >= 0 ? "+" : ""}${backlog}.`);
  lines.push(`• Stock: ${risky.length} pièces à risque (stock < cible).`);
  lines.push("");
  if (risky.length) {
    lines.push("🧯 Top pièces à sécuriser:");
    risky.slice(0, 5).forEach((p) => {
      const gap = Number(p.target ?? 0) - Number(p.onHand ?? 0);
      const ema = (p.ema as number[])?.at?.(-1) ?? 0;
      lines.push(`  - ${p.partNumber} (${p.name})  manque ${gap} • stock ${p.onHand} / cible ${p.target} • EMA≈${ema.toFixed(1)}`);
    });
  } else {
    lines.push("✅ Aucun réassort critique détecté.");
  }
  lines.push("");
  lines.push("✅ Recos rapides:");
  if (risky.length) lines.push("• Lancer un réassort immédiat sur le top 5 ci-dessus.");
  if (quoteTrend < -0.1) lines.push("• Tendance devis en baisse >10% : revoir le pricing ou la prospection.");
  if (cycleAvg > 14)
    lines.push("• Cycle WO > 14j : prioriser les plus longs WO et lever les blocages fournisseurs.");
  if (backlog > 0) lines.push("• Backlog positif : planifier ressources / heures sup ciblées.");

  const report = lines.join("\n");
  return NextResponse.json({ months, alpha, risky, quoteTrend, convAvg, backlog, cycleAvg, report });
}
