import { getParts } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

type Row = ReturnType<typeof getParts>[number] & { sku?: string };

export default function PartsPage({
  searchParams,
}: {
  searchParams?: { lowStock?: string };
}) {
  const all = getParts() as Row[];
  const onlyLow = searchParams?.lowStock === "1";
  const rows = onlyLow ? all.filter((p: any) => (p.qty ?? 0) <= (p.minQty ?? 0)) : all;

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">
        Inventaire — Pièces {onlyLow && "(Sous le seuil)"}
      </h1>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable
          rows={rows}
          cols={[
            { key: "sku" as keyof Row, label: "SKU" },
            { key: "name", label: "Nom" },
            { key: "category", label: "Cat." },
            { key: "cert", label: "Certif." },
            {
              key: "qty" as keyof Row,
              label: "Qté",
              render: (r: any) =>
                r.qty <= r.minQty ? (
                  <span className="text-red-600 font-medium">{r.qty}</span>
                ) : (
                  r.qty
                ),
            },
            { key: "minQty" as keyof Row, label: "Min" },
            { key: "unitCost" as keyof Row, label: "Coût (CAD)" },
            { key: "location" as keyof Row, label: "Emplacement" },
          ]}
        />
      </div>
    </section>
  );
}
import { getParts } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

type Row = ReturnType<typeof getParts>[number] & { sku?: string };

export default function PartsPage({
  searchParams,
}: {
  searchParams?: { lowStock?: string };
}) {
  const all = getParts() as Row[];
  const onlyLow = searchParams?.lowStock === "1";
  const rows = onlyLow ? all.filter((p: any) => (p.qty ?? 0) <= (p.minQty ?? 0)) : all;

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">
        Inventaire — Pièces {onlyLow && "(Sous le seuil)"}
      </h1>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable
          rows={rows}
          cols={[
            { key: "sku" as keyof Row, label: "SKU" },
            { key: "name", label: "Nom" },
            { key: "category", label: "Cat." },
            { key: "cert", label: "Certif." },
            {
              key: "qty" as keyof Row,
              label: "Qté",
              render: (r: any) =>
                r.qty <= r.minQty ? (
                  <span className="text-red-600 font-medium">{r.qty}</span>
                ) : (
                  r.qty
                ),
            },
            { key: "minQty" as keyof Row, label: "Min" },
            { key: "unitCost" as keyof Row, label: "Coût (CAD)" },
            { key: "location" as keyof Row, label: "Emplacement" },
          ]}
        />
      </div>
    </section>
  );
}
