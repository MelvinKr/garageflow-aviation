"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getKpis, getParts, getAircraft } from "@/lib/mock";
import { getReservedMap } from "@/lib/reservedStore";
import { KpiCard } from "@/components/KpiCard";
import { DataTable, type Sorter } from "@/components/DataTable";

export default function Page() {
  const k = getKpis();
  const parts = getParts();
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [reservedMap, setReservedMap] = useState<Record<string, number>>({});
  const aircraft = getAircraft();
  const [sorters, setSorters] = useState<Sorter<any>[]>([{ key: "qty", dir: "asc" }]);

  // Load movements + reserved once
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gf_movements");
      const arr: { sku?: string; id?: string; delta: number }[] = raw ? JSON.parse(raw) : [];
      const agg: Record<string, number> = {};
      for (const m of arr) {
        const key = m.sku || m.id;
        if (!key) continue;
        agg[key] = (agg[key] || 0) + (Number(m.delta) || 0);
      }
      setDeltas(agg);
    } catch {}
    try {
      setReservedMap(getReservedMap());
    } catch {}
  }, []);

  const effectiveParts = useMemo(() => {
    return parts.map((p: any) => {
      const key = p.sku || p.id;
      const eff = (p.qty ?? 0) + (deltas[key] || 0);
      const res = reservedMap[key] ?? p.reservedQty ?? 0;
      return { ...p, qty: eff - res };
    });
  }, [parts, deltas, reservedMap]);

  const topParts = useMemo(() => {
    return [...effectiveParts]
      .sort((a: any, b: any) => (a.qty ?? 0) - (b.qty ?? 0))
      .slice(0, 3);
  }, [effectiveParts]);

  const lowToOrder = useMemo(() => {
    return [...effectiveParts]
      .filter((p: any) => (p.qty ?? 0) <= (p.minQty ?? 0))
      .sort((a: any, b: any) => (a.qty ?? 0) - (b.qty ?? 0))
      .slice(0, 5);
  }, [effectiveParts]);

  const currency = (n: number) => `${n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  const effectiveStockValue = useMemo(() => {
    return effectiveParts.reduce((acc: number, p: any) => acc + Math.max(0, Number(p.qty) || 0) * (Number(p.unitCost) || 0), 0);
  }, [effectiveParts]);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          icon={<BagIcon />}
          label="Pièces"
          value={parts.length}
          accent="orange"
        />
        <KpiCard
          icon={<PlaneIcon />}
          label="Avions"
          value={aircraft.length}
          accent="slate"
        />
        <KpiCard
          icon={<CoinIcon />}
          label="Valeur stock"
          value={currency(effectiveStockValue)}
          accent="orange"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Top Pièces</h2>
        <div className="rounded-2xl border bg-white shadow-sm">
          <DataTable
            rows={topParts}
            cols={[
              { key: "sku" as any, label: "SKU" },
              { key: "name" as any, label: "Nom" },
              { key: "category" as any, label: "Cat." },
              { key: "cert" as any, label: "Certif." },
              { key: "qty" as any, label: "Qté" },
              { key: "minQty" as any, label: "Min" },
              { key: "location" as any, label: "Emplacement" },
            ]}
            sortable
            multiSort={false}
            sorters={sorters}
            onSortChange={setSorters}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">À commander</h2>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          {lowToOrder.length === 0 ? (
            <div className="text-sm text-slate-500">Aucune pièce sous le seuil.</div>
          ) : (
            <ul className="divide-y">
              {lowToOrder.map((p: any) => (
                <li key={p.sku || p.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">{p.name}</div>
                    <div className="text-slate-500">{p.sku || p.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-semibold">{p.qty} / {p.minQty}</div>
                    <div className="text-xs text-slate-500">Qté / Seuil</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-3 text-right">
            <Link
              href={{ pathname: "/parts", query: { lowStock: "1" } }}
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              Voir toutes
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M8 7V6a4 4 0 1 1 8 0v1h2a1 1 0 0 1 1 1l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8a1 1 0 0 1 1-1h2Zm2 0h4V6a2 2 0 1 0-4 0v1Z" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 1 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M12 2C6.477 2 2 5.582 2 10s4.477 8 10 8 10-3.582 10-8S17.523 2 12 2Zm0 14c-4.411 0-8-2.691-8-6s3.589-6 8-6 8 2.691 8 6-3.589 6-8 6Zm-1-9h2a3 3 0 1 1 0 6h-2v2h-2v-2H6v-2h3V7h2Zm2 2h-2v2h2a1 1 0 0 0 0-2Z" />
    </svg>
  );
}
