"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { useState } from "react";
import PartDrawer from "@/components/PartDrawerDb";

type Part = {
  id: string;
  sku: string;
  name: string;
  qty: number;
  minQty: number;
  location: string;
  unitCost?: number;
  unitPrice?: number;
  currency?: string;
};

export default function PartsClient({ rows, movementAction }: { rows: Part[]; movementAction: (fd: FormData)=>Promise<any> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const cols = useMemo(
    () => [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Nom" },
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
        key: "unitPrice",
        label: "Prix",
        render: (r: Part) => (
          <span>
            {typeof r.unitPrice === "number"
              ? `${(r.unitPrice || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${r.currency ?? ''}`
              : "-"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (r: Part) => (
          <form action={movementAction} className="inline">
            <input type="hidden" name="part_id" value={r.id} />
            <input type="hidden" name="type" value="OUT" />
            <input type="hidden" name="quantity" value={1} />
            <button type="submit" className="px-2 py-1 border rounded text-xs hover:bg-gray-50" title="Sortir 1">-1</button>
          </form>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable<Part> rows={rows} cols={cols as any} onRowClick={(r)=>setOpenId(r.id)} />
      </div>
      {openId && <PartDrawer id={openId} onClose={()=>setOpenId(null)} />}
    </>
  );
}
