import { getParts } from "@/lib/mock";
import { PartsTable } from "@/components/PartsTable";

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
        <PartsTable rows={rows} />
      </div>
    </section>
  );
}
