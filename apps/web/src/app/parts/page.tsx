"use client";
import { useMemo, useState } from "react";
import { getParts } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";
import { PartDrawer } from "@/components/PartDrawer";

type Row = ReturnType<typeof getParts>[number] & { sku?: string };

export default function PartsPage() {
  const all = getParts() as Row[];
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [cert, setCert] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);

  const cats = useMemo(() => Array.from(new Set(all.map((p) => p.category).filter(Boolean))) as string[], [all]);
  const certs = useMemo(() => Array.from(new Set(all.map((p) => p.cert).filter(Boolean))) as string[], [all]);

  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return all.filter((p) => {
      const matchQ = !qq ||
        (p.name?.toLowerCase().includes(qq) || p.sku?.toLowerCase().includes(qq) || p.id?.toLowerCase().includes(qq));
      const matchCat = !cat || p.category === cat;
      const matchCert = !cert || p.cert === cert;
      return matchQ && matchCat && matchCert;
    });
  }, [all, q, cat, cert]);

  const low = (qty: number, min: number) => (qty <= min ? <span className="text-red-600 font-medium">{qty}</span> : qty);

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Inventaire — Pièces</h1>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Recherche (nom, SKU)"
          className="w-64 rounded-md border px-3 py-2 text-sm"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Toutes catégories</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={cert} onChange={(e) => setCert(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Tous certificats</option>
          {certs.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(q || cat || cert) && (
          <button
            onClick={() => {
              setQ("");
              setCat("");
              setCert("");
            }}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <DataTable
        rows={rows}
        cols={[
          { key: "sku" as keyof Row, label: "SKU" },
          { key: "name", label: "Nom" },
          { key: "category", label: "Cat." },
          { key: "cert", label: "Certif." },
          { key: "qty", label: "Qté", render: (r: any) => low(r.qty, r.minQty) },
          { key: "minQty", label: "Min" },
          { key: "unitCost", label: "Coût (CAD)" },
          { key: "location", label: "Emplacement" },
        ]}
        onRowClick={(r) => setSelected(r)}
      />

      <PartDrawer part={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
