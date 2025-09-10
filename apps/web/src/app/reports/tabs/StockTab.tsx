"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { computeEMA, restockSuggestion } from "@/lib/ema";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

type Part = {
  partId: number | null;
  partNumber: string;
  name: string;
  onHand: number;
  minStock: number;
  months: string[];
  qty: number[];
  ema: number[];
  target: number;
  reorder: boolean;
};

function lastNMonthsLabels(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    out.push(ym);
  }
  return out;
}

export default function StockTab() {
  const sp = useSearchParams();
  const months = sp.get("months") ?? "12";
  const alpha = sp.get("alpha") ?? "0.5";

  const [parts, setParts] = useState<Part[]>([]);
  const [axis, setAxis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/reports/stock?months=${months}&alpha=${alpha}`, { cache: "no-store", signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);
        return r.json();
      })
      .then((j) => {
        const rows = j.parts ?? j.rows ?? [];
        const axis = j.monthsAxis ?? lastNMonthsLabels(Number(j.months ?? months));
        const a = Number(alpha);
        const ps: Part[] = (rows as any[]).map((r: any, i: number) => {
          const qty: number[] = r.qty ?? r.monthlyConsumption ?? [];
          const emaArr: number[] = r.ema ?? r.emaSeries ?? computeEMA(qty, a);
          const onHand = Number(r.onHand ?? r.on_hand ?? 0);
          const minStock = Number(r.minStock ?? r.min_stock ?? 0);
          const sugg = restockSuggestion({ onHand, ema: emaArr.at(-1) ?? 0, minStock });
          return {
            partId: r.partId ?? r.id ?? null,
            partNumber: r.partNumber ?? r.sku ?? String(r.part_id ?? i),
            name: r.name ?? "",
            onHand,
            minStock,
            months: axis,
            qty,
            ema: emaArr,
            target: sugg?.target ?? Math.max(minStock, Math.ceil((emaArr.at(-1) ?? 0) * 1.5)),
            reorder: Boolean(sugg),
          };
        });
        setParts(ps);
        setAxis(axis);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [months, alpha]);

  if (loading) return <p className="p-4">Chargement…</p>;
  if (error) return <p className="p-4 text-red-600">Erreur: {error}</p>;
  if (!parts.length) return <p className="p-4">Aucune donnée.</p>;

  const p = parts[Math.min(idx, parts.length - 1)];
  const data = useMemo(
    () => axis.map((ym, i) => ({ ym, qty: p.qty[i] ?? 0, ema: p.ema[i] ?? 0 })),
    [axis, p]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {parts.slice(0, 20).map((x, i) => (
          <button
            key={(x.partId ?? i) + String(x.partNumber)}
            onClick={() => setIdx(i)}
            className={`px-2 py-1 rounded border text-sm ${i === idx ? "bg-black text-white" : "bg-white"}`}
            title={x.name}
          >
            {x.partNumber}
            {x.reorder ? " 🔴" : ""}
          </button>
        ))}
      </div>

      <div className="text-sm">
        <span className="font-medium">{p.partNumber}</span> — {p.name} • Stock: <b>{p.onHand}</b> • Cible: <b>{p.target}</b>{" "}
        {p.reorder ? <span className="text-red-600">→ À commander</span> : <span className="text-green-600">OK</span>}
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ym" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="qty" name="Conso" />
            <Line type="monotone" dataKey="ema" name="EMA" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
