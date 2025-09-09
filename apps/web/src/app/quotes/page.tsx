import { getQuotes } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function QuotesPage() {
  const rows = getQuotes();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Devis</h1>
      <DataTable
        rows={rows}
        cols={[
          { key: "id", label: "Devis #" },
          { key: "customerId", label: "Client" },
          { key: "aircraftId", label: "Avion" },
          { key: "status", label: "Statut" },
          { key: "createdAt", label: "Créé le" },
          { key: "total", label: "Total CAD" }
        ]}
      />
    </main>
  );
}

