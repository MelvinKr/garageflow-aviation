"use client";
import { useState } from "react";
import { MAINT_TEMPLATES } from "@/lib/maintenanceTemplates";
import { createWoFromTemplate } from "@/lib/generateWoFromTemplate";
import { getAircraft } from "@/lib/mock";
import { useToast } from "@/components/ui/useToast";

export default function TemplatesPage() {
  const { push } = useToast();
  const aircraft = getAircraft();
  const [acId, setAcId] = useState(aircraft[0]?.id ?? "");

  async function generate(templateId: string) {
    try {
      const { woId } = await createWoFromTemplate(templateId, acId);
      push({ type: "success", message: `WO ${woId} généré` });
      location.href = `/workorders/${woId}`;
    } catch (e: any) {
      console.error(e);
      push({ type: "error", message: e?.message || "Erreur génération" });
    }
  }

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Templates de révision</h1>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Appareil cible</span>
        <select className="border rounded px-2 py-1 text-sm" value={acId} onChange={(e)=>setAcId(e.target.value)}>
          {aircraft.map((a:any) => <option key={a.id} value={a.id}>{a.reg} — {a.type}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {MAINT_TEMPLATES.map((t) => (
          <div key={t.id} className="border rounded p-3">
            <div className="text-sm text-gray-500">{t.aircraftType}</div>
            <div className="font-medium">{t.label}</div>
            <ul className="mt-2 text-sm list-disc pl-5">
              {t.tasks.map((x, i) => (
                <li key={i}>
                  {x.label}
                  {x.partSku ? ` — ${x.partSku} x ${x.qty ?? 1}` : ""}
                  {x.hours ? ` — ${x.hours}h @${x.rate ?? 95}` : ""}
                </li>
              ))}
            </ul>
            <button className="mt-3 px-3 py-1 border rounded text-sm hover:bg-gray-50" onClick={() => generate(t.id)}>
              Générer le WO
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

