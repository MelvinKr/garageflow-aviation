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
import { getSuppliers, getParts } from "@/lib/mock";

export default function SuppliersPage() {
  const suppliers = getSuppliers();
  const parts = getParts();
  const countBySupplier = new Map<string, number>();
  for (const p of parts as any[]) countBySupplier.set(p.supplierId, (countBySupplier.get(p.supplierId) ?? 0) + 1);

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Fournisseurs</h1>
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Nom</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Téléphone</th>
              <th className="px-3 py-2 text-left">Pièces</th>
              <th className="px-3 py-2 text-left">Lead time</th>
              <th className="px-3 py-2 text-left">Devise</th>
            </tr>
          </thead>
          <tbody>
            {(suppliers as any[]).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.email}</td>
                <td className="px-3 py-2">{s.phone}</td>
                <td className="px-3 py-2">{countBySupplier.get(s.id) ?? 0}</td>
                <td className="px-3 py-2">{s.leadTimeDays ?? "—"} j</td>
                <td className="px-3 py-2">{s.currency ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
