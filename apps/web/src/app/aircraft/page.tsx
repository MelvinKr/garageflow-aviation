import { getAircraft } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function AircraftPage() {
  const rows = getAircraft();
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Avions</h1>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable
          rows={rows}
          cols={[
            { key: "id", label: "ID" },
            { key: "type", label: "Type" },
            { key: "reg", label: "Immatriculation" },
            { key: "hours", label: "Heures" },
            { key: "ownerId", label: "Client" },
          ]}
        />
      </div>
    </main>
  );
}
