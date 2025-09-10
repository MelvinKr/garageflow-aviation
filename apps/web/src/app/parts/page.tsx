import PartsClient from "./PartsClient";
import { listPartsAction, createMovementAction } from "./actions";
import { toCSV, downloadCSV } from "@/lib/csv";

export default async function PartsPage({ searchParams }: { searchParams?: Promise<{ lowStock?: string }> }) {
  const sp = (await (searchParams ?? Promise.resolve({}))) as any;
  const onlyLow = sp?.lowStock === "1";
  const parts = await listPartsAction({ limit: 200 });
  const rows = parts
    .map((p) => ({
      id: p.id,
      sku: p.part_number,
      name: p.name,
      qty: Number(p.on_hand ?? 0),
      minQty: Number(p.min_stock ?? 0),
      location: "",
    }))
    .filter((p) => (onlyLow ? Number(p.qty ?? 0) <= Number(p.minQty ?? 0) : true));

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inventaire – Pièces {onlyLow && "(Sous le seuil)"}</h1>
        <nav className="text-sm space-x-3">
          <a href="/parts" className="underline">Toutes</a>
          <a href="/parts?lowStock=1" className="underline">Sous le seuil</a>
          <button
            className="ml-4 px-3 py-1 border rounded text-sm hover:bg-gray-50"
            onClick={() => downloadCSV("inventaire.csv", toCSV(rows as any))}
          >
            Export CSV
          </button>
        </nav>
      </div>

      <PartsClient
        rows={rows as any}
        movementAction={async (fd: FormData) => {
          "use server";
          const part_id = String(fd.get("part_id") || "");
          const type = String(fd.get("type") || "OUT") as any;
          const quantity = Number(fd.get("quantity") || 1);
          await createMovementAction({ part_id, type, quantity, note: "Action rapide" });
        }}
      />
    </section>
  );
}
