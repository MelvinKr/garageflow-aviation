import { listCustomers } from "@/data/customers.repo";

export default async function CustomersPage() {
  const customers = await listCustomers({ limit: 500 });

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
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2">{(c as any).billing_address ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
