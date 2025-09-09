import { getCustomers } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function CustomersPage() {
  const rows = getCustomers();
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
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
import { getCustomers, getAircraft } from "@/lib/mock";

export default function CustomersPage() {
  const customers = getCustomers();
  const aircraft = getAircraft();
  const planesByOwner = new Map<string, number>();
  for (const a of aircraft as any[]) planesByOwner.set(a.ownerId, (planesByOwner.get(a.ownerId) ?? 0) + 1);

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Clients</h1>
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Nom</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Téléphone</th>
              <th className="px-3 py-2 text-left">Appareils</th>
              <th className="px-3 py-2 text-left">Conditions</th>
            </tr>
          </thead>
          <tbody>
            {(customers as any[]).map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.phone}</td>
                <td className="px-3 py-2">{planesByOwner.get(c.id) ?? 0}</td>
                <td className="px-3 py-2">{c.terms ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
