import { getAircraft } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function AircraftPage() {
  const rows = getAircraft();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Avions</h1>
      <DataTable
        rows={rows}
        cols={[
          { key: "id", label: "ID" },
          { key: "type", label: "Type" },
          { key: "reg", label: "Immatriculation" },
          { key: "hours", label: "Heures" },
          { key: "ownerId", label: "Client" }
        ]}
      />
    </main>
  );
}

