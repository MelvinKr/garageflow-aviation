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
};

export default function PartsClient({ rows }: { rows: Part[] }) {
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
