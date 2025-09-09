import { getQuotes } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function QuotesPage() {
  const rows = getQuotes();
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Devis</h1>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable
          rows={rows}
          cols={[
            { key: "id", label: "Devis #" },
            { key: "customerId", label: "Client" },
            { key: "aircraftId", label: "Avion" },
            { key: "status", label: "Statut" },
            { key: "createdAt", label: "Créé le" },
            { key: "total", label: "Total CAD" },
          ]}
        />
      </div>
    </main>
  );
}
