import { getAircraft, getCustomers } from "@/lib/mock";

export default function AircraftPage() {
  const aircraft = getAircraft();
  const customers = getCustomers();
  const ownerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id;

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Flotte — Avions</h1>
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Immat.</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Heures</th>
              <th className="px-3 py-2 text-left">Cycles</th>
              <th className="px-3 py-2 text-left">Base</th>
              <th className="px-3 py-2 text-left">Propriétaire</th>
              <th className="px-3 py-2 text-left">Entretien à venir</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((a: any) => {
              const due = a.nextDue?.dueAtHours != null
                ? `${Math.max(0, a.nextDue.dueAtHours - a.hours).toFixed(1)} h`
                : (a.nextDue?.dueDate ?? "—");
              return (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{a.reg}</td>
                  <td className="px-3 py-2">{a.type}</td>
                  <td className="px-3 py-2">{a.hours}</td>
                  <td className="px-3 py-2">{a.cycles ?? "—"}</td>
                  <td className="px-3 py-2">{a.base ?? "—"}</td>
                  <td className="px-3 py-2">{ownerName(a.ownerId)}</td>
                  <td className="px-3 py-2">{due}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}