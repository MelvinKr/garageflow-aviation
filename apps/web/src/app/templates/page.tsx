import { listAircraft } from "@/data/aircraft.repo";
import { MAINT_TEMPLATES } from "@/lib/maintenanceTemplates";

export default async function TemplatesPage() {
  const aircraft = await listAircraft({ limit: 500 });
  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Templates de révision</h1>
      <p className="text-sm text-gray-600">Sélection/génération à finaliser (actions serveur). Appareils disponibles: {aircraft.length}</p>

      <div className="grid md:grid-cols-2 gap-3">
        {MAINT_TEMPLATES.map((t) => (
          <div key={t.id} className="border rounded p-3">
            <div className="text-sm text-gray-500">{t.aircraftType}</div>
            <div className="font-medium">{t.label}</div>
            <ul className="mt-2 text-sm list-disc pl-5">
              {t.tasks.map((x, i) => (
                <li key={i}>
                  {x.label}
                  {x.partSku ? ` • ${x.partSku} x ${x.qty ?? 1}` : ""}
                  {x.hours ? ` • ${x.hours}h @${x.rate ?? 95}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}