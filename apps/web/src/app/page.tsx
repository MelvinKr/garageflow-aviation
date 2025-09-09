import { getKpis } from "@/lib/mock";
import { StatCard } from "@/components/StatCard";

export default function Page() {
  const k = getKpis();
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">GarageFlow Aviation — Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Articles bas stock" value={k.lowStock} />
        <StatCard label="Valeur stock (CAD)" value={k.totalStockValue} />
        <StatCard label="WO en cours" value={k.openWo} />
        <StatCard label="Devis envoyés" value={k.quotesSent} />
      </div>
    </main>
  );
}
