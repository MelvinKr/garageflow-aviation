"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getParts } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";
import type { Sorter } from "@/components/DataTable";
import { getReservedMap, setReservedFor } from "@/lib/reservedStore";
import { PartDrawer } from "@/components/PartDrawer";

type Row = ReturnType<typeof getParts>[number] & { sku?: string };

export default function PartsPage() {
  const all = getParts() as Row[];
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [reservedMap, setReservedMap] = useState<Record<string, number>>({});
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [cert, setCert] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [sorters, setSorters] = useState<Sorter<Row>[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);

  const cats = useMemo(() => Array.from(new Set(all.map((p) => p.category).filter(Boolean))) as string[], [all]);
  const certs = useMemo(() => Array.from(new Set(all.map((p) => p.cert).filter(Boolean))) as string[], [all]);

  // Load persisted movements once
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gf_movements");
      if (!raw) return;
      const arr: { sku?: string; id?: string; delta: number }[] = JSON.parse(raw);
      const agg: Record<string, number> = {};
      for (const m of arr) {
        const key = m.sku || m.id;
        if (!key) continue;
        agg[key] = (agg[key] || 0) + (Number(m.delta) || 0);
      }
      setDeltas(agg);
    } catch {}
  }, []);

  // Load reserved map once
  useEffect(() => {
    try {
      setReservedMap(getReservedMap());
    } catch {}
  }, []);

  // Initialize from URL
  useEffect(() => {
    const q0 = search.get("q") ?? "";
    const cat0 = search.get("cat") ?? "";
    const cert0 = search.get("cert") ?? "";
    const low0 = search.get("low") === "1" || search.get("lowStock") === "1";
    const sort0 = search.get("sort") ?? "";
    setQ(q0);
    setCat(cat0);
    setCert(cert0);
    setOnlyLow(low0);
    if (sort0) {
      const parsed = sort0
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((pair) => {
          const [k, d] = pair.split(":");
          return { key: k as keyof Row, dir: d === "desc" ? "desc" : "asc" } as Sorter<Row>;
        });
      setSorters(parsed);
    } else {
      setSorters([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Persist to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("cat", cat);
    if (cert) params.set("cert", cert);
    if (onlyLow) params.set("low", "1");
    if (sorters.length) params.set("sort", sorters.map((s) => `${String(s.key)}:${s.dir}`).join(","));
    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${search.toString()}`;
    if (next !== current) router.replace(next, { scroll: false });
  }, [q, cat, cert, onlyLow, sorters, pathname, router, search]);

  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const filtered = all.filter((p) => {
      const matchQ =
        !qq || p.name?.toLowerCase().includes(qq) || p.sku?.toLowerCase().includes(qq) || p.id?.toLowerCase().includes(qq);
      const matchCat = !cat || p.category === cat;
      const matchCert = !cert || p.cert === cert;
      return matchQ && matchCat && matchCert;
    });
    // apply effective quantity with local deltas
    const withQty = filtered.map((p) => {
      const key = p.sku || p.id;
      const eff = (p.qty ?? 0) + (deltas[key] || 0);
      const res = reservedMap[key] ?? p.reservedQty ?? 0;
      return { ...p, qty: eff - res };
    });
    return onlyLow ? withQty.filter((p) => (p.qty ?? 0) <= (p.minQty ?? 0)) : withQty;
  }, [all, q, cat, cert, deltas, reservedMap, onlyLow]);

  const low = (qty: number, min: number) => (qty <= min ? <span className="text-red-600 font-medium">{qty}</span> : qty);

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Inventaire — Pièces</h1>

      <div className="flex flex-wrap items-center gap-2">
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
        {(q || cat || cert || onlyLow || sorters.length) && (
          <button
            onClick={() => {
              setQ("");
              setCat("");
              setCert("");
              setOnlyLow(false);
              setSorters([]);
            }}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            Réinitialiser
          </button>
        )}

        <button
          onClick={() => setOnlyLow((v) => !v)}
          className={`rounded-full px-3 py-1.5 text-sm ring-1 ${
            onlyLow ? "bg-red-600 text-white ring-red-600" : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
          }`}
        >
          Bas stock
        </button>

        <button
          onClick={() => exportCsv(rows)}
          className="ml-auto rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
        >
          Exporter CSV
        </button>
        <button
          onClick={() => {
            try {
              localStorage.removeItem("gf_movements");
            } catch {}
            setDeltas({});
          }}
          className="rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
        >
          Reset mouvements
        </button>
      </div>

      <DataTable
        rows={rows}
        cols={[
          { key: "sku" as keyof Row, label: "SKU" },
          {
            key: "name",
            label: "Nom",
            render: (r: any) => (
              <span className="inline-flex items-center gap-2">
                {r.name}
                {r.qty <= r.minQty && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">LOW</span>
                )}
              </span>
            ),
          },
          { key: "category", label: "Cat." },
          { key: "cert", label: "Certif." },
          { key: "qty", label: "Qté", render: (r: any) => low(r.qty, r.minQty) },
          { key: "minQty", label: "Min" },
          { key: "unitCost", label: "Coût (CAD)" },
          { key: "location", label: "Emplacement" },
        ]}
        onRowClick={(r) => setSelected(r)}
        multiSort
        sorters={sorters}
        onSortChange={setSorters}
      />

      <TotalsBar rows={rows as any[]} />

      <PartDrawer
        part={selected}
        onClose={() => setSelected(null)}
        onMovement={(delta, reason, fileName) => {
          if (!selected) return;
          const key = selected.sku || selected.id;
          setDeltas((prev) => ({ ...prev, [key]: (prev[key] || 0) + delta }));
          try {
            const raw = localStorage.getItem("gf_movements");
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ sku: selected.sku, id: selected.id, delta, reason, fileName, at: new Date().toISOString() });
            localStorage.setItem("gf_movements", JSON.stringify(arr));
          } catch {}
        }}
        onReservedChange={(key, qty) => {
          setReservedFor(key, qty);
          setReservedMap((prev) => ({ ...prev, [key]: qty }));
        }}
        onMovementsReset={(key) => {
          // recompute deltas from LS
          try {
            const raw = localStorage.getItem("gf_movements");
            const arr: { sku?: string; id?: string; delta: number }[] = raw ? JSON.parse(raw) : [];
            const agg: Record<string, number> = {};
            for (const m of arr) {
              const k = m.sku || m.id;
              if (!k) continue;
              agg[k] = (agg[k] || 0) + (Number(m.delta) || 0);
            }
            setDeltas(agg);
          } catch {
            setDeltas({});
          }
        }}
      />
    </section>
  );
}

function TotalsBar({ rows }: { rows: any[] }) {
  const qty = rows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0);
  const value = rows.reduce((acc, r) => acc + (Number(r.qty) || 0) * (Number(r.unitCost) || 0), 0);
  const formatted = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "CAD" }).replace("CA$", "CAD ");
  return (
    <div className="flex items-center justify-end gap-6 text-sm text-gray-700">
      <div>
        Articles: <span className="font-medium">{rows.length}</span>
      </div>
      <div>
        Qté totale: <span className="font-medium">{qty}</span>
      </div>
      <div>
        Valeur stock: <span className="font-semibold">{formatted(Number(value.toFixed(2)))}</span>
      </div>
    </div>
  );
}

function exportCsv(rows: any[]) {
  const headers = ["sku", "name", "category", "cert", "qty", "minQty", "unitCost", "location"];
  const esc = (v: any) => {
    const s = String(v ?? "");
    if (s.includes(";") || s.includes("\n") || s.includes("\"")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.join(";")].concat(rows.map((r) => headers.map((h) => esc((r as any)[h])).join(";")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `parts-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
