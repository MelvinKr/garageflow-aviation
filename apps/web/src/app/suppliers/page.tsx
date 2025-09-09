import { getSuppliers } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function SuppliersPage() {
  const rows = getSuppliers();
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Fournisseurs</h1>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable
          rows={rows}
          cols={[
            { key: "id", label: "ID" },
            { key: "name", label: "Nom" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Téléphone" },
          ]}
        />
      </div>
    </main>
  );
}
