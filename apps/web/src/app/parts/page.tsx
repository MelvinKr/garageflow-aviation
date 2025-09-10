"use client";
import PartsClient from "./PartsClient";
import { getParts } from "@/lib/mock";
import { toCSV, downloadCSV } from "@/lib/csv";

export default function PartsPage({
  searchParams,
}: { searchParams?: { lowStock?: string } }) {
  const all = getParts();
  const onlyLow = searchParams?.lowStock === "1";
  const rows = all
    .map((p: any) => ({
      ...p,
      qty: Number(p.qty ?? 0) - Number(p.reservedQty ?? 0),
    }))
    .filter((p: any) => (onlyLow ? Number(p.qty ?? 0) <= Number(p.minQty ?? 0) : true));

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Inventaire — Pièces {onlyLow && "(Sous le seuil)"}
        </h1>
        <nav className="text-sm space-x-3">
          <a href="/parts" className="underline">
            Toutes
          </a>
          <a href="/parts?lowStock=1" className="underline">
            Sous le seuil
          </a>
          <button
            className="ml-4 px-3 py-1 border rounded text-sm hover:bg-gray-50"
            onClick={() => {
              const data = getParts().map((p: any) => ({
                id: p.id,
                sku: p.sku,
                name: p.name,
                qty: p.qty,
                reserved: p.reservedQty ?? 0,
                min: p.minQty ?? 0,
                unitCost: p.unitCost ?? 0,
                location: p.location ?? "",
              }));
              downloadCSV("inventaire.csv", toCSV(data));
            }}
          >
            Export CSV
          </button>
        </nav>
      </div>

      <PartsClient rows={rows as any} />
    </section>
  );
}
