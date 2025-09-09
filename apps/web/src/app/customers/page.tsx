import { getCustomers } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function CustomersPage() {
  const rows = getCustomers();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Clients</h1>
      <DataTable
        rows={rows}
        cols={[
          { key: "id", label: "ID" },
          { key: "name", label: "Nom" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Téléphone" }
        ]}
      />
    </main>
  );
}

