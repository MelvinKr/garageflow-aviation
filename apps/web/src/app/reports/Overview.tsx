"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Q = { ym: string; count: number; total: number; conversion: number };
type W = { ym: string; opened: number; closed: number; avgCycleDays: number };

export default function Overview() {
  const sp = useSearchParams();
  const months = sp.get("months") ?? "12";
  const alpha = sp.get("alpha") ?? "0.5";
  const [quotes, setQuotes] = useState<Q[]>([]);
  const [wo, setWO] = useState<W[]>([]);
  const [stock, setStock] = useState<any>(null);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      fetch(`/api/reports/quotes?months=${months}`, { cache: "no-store", signal: ac.signal }).then((r) => r.json()),
      fetch(`/api/reports/wo?months=${months}`, { cache: "no-store", signal: ac.signal }).then((r) => r.json()),
      fetch(`/api/reports/stock?months=${months}&alpha=${alpha}`, { cache: "no-store", signal: ac.signal }).then((r) => r.json()),
    ]).then(([q, w, s]) => {
      setQuotes((q.items ?? q) as Q[]);
      setWO((w.items ?? w) as W[]);
      setStock(s);
    });
    return () => ac.abort();
  }, [months, alpha]);

  const kpis = useMemo(() => {
    const totalQuotes = quotes.reduce((s, x) => s + (Number(x.total ?? 0)), 0);
    const conv = quotes.length ? quotes.reduce((s, x) => s + Number(x.conversion ?? 0), 0) / quotes.length : 0;
    const avgCycle = wo.length ? wo.reduce((s, x) => s + Number(x.avgCycleDays ?? 0), 0) / wo.length : 0;
    const parts = stock?.parts ?? stock?.rows ?? [];
    const reorderCount = (parts as any[]).filter((p: any) => p.reorder).length ?? 0;
    return {
      totalQuotes: Number(totalQuotes.toFixed(2)),
      conv: Number((conv * 100).toFixed(1)),
      avgCycle: Number(avgCycle.toFixed(1)),
      reorderCount,
    };
  }, [quotes, wo, stock]);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Montant devis cumulé" value={`${kpis.totalQuotes} €`} />
        <Kpi title="Taux conv. moyen" value={`${kpis.conv}%`} />
        <Kpi title="Cycle moyen WO" value={`${kpis.avgCycle} j`} />
        <Kpi title="Pièces à commander" value={String(kpis.reorderCount)} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Devis — Montant">
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={quotes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ym" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" name="Montant" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Work Orders — Ouverts/Fermés">
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={wo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ym" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="opened" name="Ouverts" />
                <Bar dataKey="closed" name="Fermés" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="text-sm font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}

