import { listSuppliers } from "@/data/suppliers.repo";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers({ limit: 500 });

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
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.email}</td>
                <td className="px-3 py-2">{s.phone}</td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2">{(s as any).lead_time_days ?? "-"} j</td>
                <td className="px-3 py-2">{s.currency ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
