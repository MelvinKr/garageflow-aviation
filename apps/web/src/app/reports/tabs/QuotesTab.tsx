"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, ResponsiveContainer, YAxisProps } from "recharts";

type QuotePoint = { ym: string; count: number; total: number; conversion: number };

export default function QuotesTab() {
  const sp = useSearchParams();
  const months = sp.get("months") ?? "12";
  const [items, setItems] = useState<QuotePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/reports/quotes?months=${months}`, { cache: "no-store", signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);
        return r.json();
      })
      .then((j) => {
        const rows = j.items ?? j;
        const mapped: QuotePoint[] = (rows as any[]).map((r) => ({
          ym: r.ym ?? r.month,
          count: Number(r.count ?? 0),
          total: Number(r.total ?? 0),
          conversion: Number(r.conversion ?? r.conversionRate ?? 0),
        }));
        setItems(mapped);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [months]);

  const totalYProps: YAxisProps = useMemo(() => ({ domain: [0, (d: any) => Math.ceil(d * 1.2)] }), []);
  if (loading) return <p className="p-4">Chargement…</p>;
  if (error) return <p className="p-4 text-red-600">Erreur: {error}</p>;
  if (!items.length) return <p className="p-4">Aucune donnée.</p>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="text-sm font-medium">Nombre de devis / mois</div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ym" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="# Devis" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Montant & Taux de conversion</div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ym" />
              <YAxis yAxisId="left" {...totalYProps} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="total" name="Montant" />
              <Line yAxisId="right" type="monotone" dataKey="conversion" name="Taux conv." />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
