type StockPart = { partNumber:string; name:string; onHand:number; target:number; reorder:boolean; ema:number[] };
type QuoteItem = { ym:string; count:number; total:number; conversion:number };
type WOItem    = { ym:string; opened:number; closed:number; avgCycleDays:number };

export function buildReportPrompt(params: {
  org?: string;
  months: number|string;
  alpha: number|string;
  stock: { parts: StockPart[]; monthsAxis: string[] };
  quotes: { items: QuoteItem[] };
  wo: { items: WOItem[] };
}) {
  const { org = "GarageFlow Aviation", months, alpha, stock, quotes, wo } = params;

  const risky = stock.parts.filter(p => p.reorder)
    .sort((a,b)=> (b.target-b.onHand) - (a.target-a.onHand))
    .slice(0, 20);

  const totalQuotes = quotes.items.reduce((s,x)=> s+(x.total??0), 0);
  const convAvg = quotes.items.length
    ? quotes.items.reduce((s,x)=> s+(x.conversion??0), 0) / quotes.items.length
    : 0;
  const cycleAvg = wo.items.length
    ? wo.items.reduce((s,x)=> s+(x.avgCycleDays??0), 0) / wo.items.length
    : 0;

  const json = {
    org, months, alpha,
    kpis: {
      totalQuotes, convAvg, cycleAvg,
      riskyCount: risky.length,
    },
    risky: risky.map(p => ({
      partNumber: p.partNumber, name: p.name,
      onHand: p.onHand, target: p.target, lastEMA: p.ema.at(-1) ?? 0
    })),
    quotes: quotes.items,
    wo: wo.items,
  };

  const system = [
    "Tu es un analyste MRO (maintenance aéronautique).",
    "Génère un rapport en **markdown** concis, actionnable, avec sections et listes.",
    "Inclure : Synthèse exécutive, Stock (réassort priorisé), Devis (tendance, conversion), WO (cycle, backlog), Recommandations.",
    "Donne des chiffres clés et seuils. Évite le blabla, garde un ton pro.",
  ].join(" ");

  const user = [
    "Voici les agrégats (JSON). Rédige le rapport demandé.",
    "Si certaines sections n'ont pas de données, dis-le simplement."
  ].join(" ");

  return { system, user, json };
}

