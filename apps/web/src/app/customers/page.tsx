import { listCustomers } from "@/data/customers.repo";
import { listAircraft } from "@/data/aircraft.repo";

export default async function CustomersPage() {
  const [customers, aircraft] = await Promise.all([listCustomers({ limit: 500 }), listAircraft({ limit: 1000 })]);
  const planesByOwner = new Map<string, number>();
  for (const a of aircraft as any[]) planesByOwner.set((a as any).owner_id ?? (a as any).ownerId, (planesByOwner.get((a as any).owner_id ?? (a as any).ownerId) ?? 0) + 1);

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
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.phone}</td>
                <td className="px-3 py-2">{planesByOwner.get(c.id) ?? 0}</td>
                <td className="px-3 py-2">{(c as any).terms ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
