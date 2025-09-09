"use client";
import { DataTable, type Col } from "@/components/DataTable";

type Row = {
  sku?: string;
  id?: string;
  name?: string;
  category?: string;
  cert?: string;
  qty?: number;
  minQty?: number;
  unitCost?: number;
  location?: string;
};

export function PartsTable({ rows }: { rows: Row[] }) {
  const cols: Col<Row>[] = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Nom" },
    { key: "category", label: "Cat." },
    { key: "cert", label: "Certif." },
    {
      key: "qty",
      label: "Qté",
      render: (r) => (r.qty! <= (r.minQty ?? 0) ? <span className="text-red-600 font-medium">{r.qty}</span> : r.qty as any),
    },
    { key: "minQty", label: "Min" },
    { key: "unitCost", label: "Coût (CAD)" },
    { key: "location", label: "Emplacement" },
  ];
  return <DataTable rows={rows} cols={cols} />;
}

