"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

type WO = { ym: string; opened: number; closed: number; avgCycleDays: number };

export default function WOTab() {
  const sp = useSearchParams();
  const months = sp.get("months") ?? "12";
  const [items, setItems] = useState<WO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/reports/wo?months=${months}`, { cache: "no-store", signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);
        return r.json();
      })
      .then((j) => {
        const rows = j.items ?? j;
        const mapped: WO[] = (rows as any[]).map((r) => ({
          ym: r.ym ?? r.month,
          opened: Number(r.opened ?? 0),
          closed: Number(r.closed ?? 0),
          avgCycleDays: Number(r.avgCycleDays ?? 0),
        }));
        setItems(mapped);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [months]);

  if (loading) return <p className="p-4">Chargement…</p>;
  if (error) return <p className="p-4 text-red-600">Erreur: {error}</p>;
  if (!items.length) return <p className="p-4">Aucune donnée.</p>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="text-sm font-medium">WO ouverts vs fermés</div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ym" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="opened" name="Ouverts" />
              <Bar dataKey="closed" name="Fermés" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Cycle moyen (jours)</div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ym" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgCycleDays" name="Cycle moyen (j)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
