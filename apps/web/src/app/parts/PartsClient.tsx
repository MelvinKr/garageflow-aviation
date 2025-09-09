"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { PartDrawer } from "@/components/PartDrawer";

type Part = {
  id: string;
  sku: string;
  name: string;
  category: string;
  cert: string;
  unitCost: number;
  qty: number;
  minQty: number;
  location: string;
  supplierId?: string;
  trace?: any;
};

export default function PartsClient({ rows }: { rows: Part[] }) {
  const [selected, setSelected] = useState<Part | null>(null);

  const cols = useMemo(
    () => [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Nom" },
      { key: "category", label: "Cat." },
      { key: "cert", label: "Certif." },
      {
        key: "qty",
        label: "Dispo / Min",
        render: (r: Part) => (
          <span>
            {r.qty <= r.minQty ? (
              <span>
                <span className="font-semibold text-red-600">{r.qty}</span> / {r.minQty}
              </span>
            ) : (
              <span>
                {r.qty} / {r.minQty}
              </span>
            )}
          </span>
        ),
      },
      { key: "location", label: "Emplacement" },
      {
        key: "actions",
        label: "Actions",
        render: (r: Part) => (
          <button
            onClick={() => setSelected(r)}
            className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50"
            aria-label={`Voir ${r.name}`}
          >
            Détails
          </button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable<Part> rows={rows} cols={cols as any} onRowClick={undefined} />
      </div>
      <PartDrawer
        part={selected}
        onClose={() => setSelected(null)}
        onSave={(updated) => {
          // mock: close drawer; real impl would update state
          setSelected(null);
        }}
      />
    </>
  );
}

