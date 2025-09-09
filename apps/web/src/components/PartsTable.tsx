"use client";
import { DataTable, type Col } from "@/components/DataTable";

type Row = {
  sku?: string;
  id?: string;
  name?: string;
  category?: string;
  cert?: string;
  qty?: number;
  minQty?: number; // still present in data
  min?: number; // computed server-side for display
  unitCost?: number;
  location?: string;
  supplierName?: string;
  dispo?: number;
  poHref?: string;
};

export function PartsTable({ rows }: { rows: Row[] }) {
  const cols: Col<Row>[] = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Nom" },
    { key: "category", label: "Cat." },
    { key: "cert", label: "Certif." },
    {
      key: "dispo",
      label: "Dispo / Min",
      render: (r) => {
        const node = `${r.dispo ?? 0} / ${r.min ?? r.minQty ?? 0}`;
        const low = Number(r.dispo ?? 0) <= Number(r.min ?? r.minQty ?? 0);
        return low ? <span className="text-red-600 font-semibold">{node}</span> : (node as any);
      },
    },
    { key: "location", label: "Emplacement" },
    { key: "supplierName", label: "Fournisseur" },
    {
      key: "poHref" as any,
      label: "Actions",
      render: (r) => (
        <a href={r.poHref} className="inline-flex items-center rounded border px-3 py-1 text-sm hover:bg-gray-50">
          Commander
        </a>
      ),
    },
  ];
  return <DataTable rows={rows} cols={cols} />;
}
