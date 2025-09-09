"use client";
import { useMemo, useState } from "react";
import { getKpis, getParts, getAircraft } from "@/lib/mock";
import { KpiCard } from "@/components/KpiCard";
import { DataTable, type Sorter } from "@/components/DataTable";

export default function Page() {
  const k = getKpis();
  const parts = getParts();
  const aircraft = getAircraft();
  const [sorters, setSorters] = useState<Sorter<any>[]>([{ key: "qty", dir: "asc" }]);

  const topParts = useMemo(() => {
    return [...parts]
      .sort((a: any, b: any) => (a.qty ?? 0) - (b.qty ?? 0))
      .slice(0, 3);
  }, [parts]);

  const currency = (n: number) => `${n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

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
          value={currency(k.totalStockValue)}
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
