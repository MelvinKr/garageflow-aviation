import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/KpiCard";

async function count(table: string) {
  const supabase = await createSupabaseServerClient();
  const { count: c } = await supabase.from(table).select("*", { count: "exact", head: true });
  return c ?? 0;
}

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const [partsCount, aircraftCount] = await Promise.all([
    count("parts"),
    count("aircraft"),
  ]);
  const { data: partsList } = await supabase
    .from("parts")
    .select("id,part_number,name,on_hand,min_stock")
    .limit(1000);
  const parts = (partsList ?? []).map((p: any) => ({
    id: p.id,
    sku: p.part_number,
    name: p.name,
    qty: Number(p.on_hand ?? 0),
    minQty: Number(p.min_stock ?? 0),
  }));
  const lowToOrder = parts
    .filter((p) => (p.qty ?? 0) <= (p.minQty ?? 0))
    .sort((a, b) => (a.qty ?? 0) - (b.qty ?? 0))
    .slice(0, 5);
  const topLow = [...parts].sort((a, b) => (a.qty ?? 0) - (b.qty ?? 0)).slice(0, 3);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard icon={<BagIcon />} label="Pièces" value={partsCount} accent="orange" />
        <KpiCard icon={<PlaneIcon />} label="Avions" value={aircraftCount} accent="slate" />
        <KpiCard icon={<CoinIcon />} label="Valeur stock" value="—" accent="orange" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Top pièces (stock bas)</h2>
        <div className="rounded-2xl border bg-white shadow-sm">
          <ul className="divide-y">
            {topLow.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-2 px-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 truncate">{p.name}</div>
                  <div className="text-slate-500">{p.sku}</div>
                </div>
                <div className="text-right">
                  <div className={`${p.qty <= p.minQty ? 'text-red-600' : ''} font-semibold`}>{p.qty} / {p.minQty}</div>
                  <div className="text-xs text-slate-500">Qté / Seuil</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">À commander</h2>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          {lowToOrder.length === 0 ? (
            <div className="text-sm text-slate-500">Aucune pièce sous le seuil.</div>
          ) : (
            <ul className="divide-y">
              {lowToOrder.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">{p.name}</div>
                    <div className="text-slate-500">{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-semibold">{p.qty} / {p.minQty}</div>
                    <div className="text-xs text-slate-500">Qté / Seuil</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-3 text-right">
            <Link href={{ pathname: "/parts", query: { lowStock: "1" } } as any} className="text-sm font-medium text-blue-700 hover:underline">Voir toutes</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M8 7V6a4 4 0 1 1 8 0v1h2a1 1 0 0 1 1 1l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8a1 1 0 0 1 1-1h2Zm2 0h4V6a2 2 0 1 0-4 0v1Z" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 1 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M12 2C6.477 2 2 5.582 2 10s4.477 8 10 8 10-3.582 10-8S17.523 2 12 2Zm0 14c-4.411 0-8-2.691-8-6s3.589-6 8-6 8 2.691 8 6-3.589 6-8 6Zm-1-9h2a3 3 0 1 1 0 6h-2v2h-2v-2H6v-2h3V7h2Zm2 2h-2v2h2a1 1 0 0 0 0-2Z" />
    </svg>
  );
}
