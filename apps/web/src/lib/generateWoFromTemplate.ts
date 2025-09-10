import { Repos } from "@/data";
import { MAINT_TEMPLATES } from "./maintenanceTemplates";
import { getParts } from "@/lib/mock";

function findPartIdBySku(sku?: string) {
  if (!sku) return undefined;
  const p = getParts().find((x: any) => x.sku === sku);
  return p?.id;
}

export async function createWoFromTemplate(templateId: string, aircraftId: string) {
  const t = MAINT_TEMPLATES.find((x) => x.id === templateId);
  if (!t) throw new Error("Template introuvable");

  const quoteId = `Q-TPL-${Date.now()}`;
  const items = t.tasks.map((task) => {
    if (task.partSku) {
      return {
        id: `QI-${Math.random()}`,
        kind: "part" as const,
        label: task.label,
        partId: findPartIdBySku(task.partSku),
        qty: task.qty ?? 1,
        unit: undefined,
        hours: undefined,
        rate: undefined,
      };
    }
    return { id: `QI-${Math.random()}`,
      kind: "labor" as const,
      label: task.label,
      hours: task.hours ?? 1,
      rate: task.rate ?? 95 };
  });

  // Simuler un WO et réserver les pièces nécessaires
  const woId = `WO-TPL-${Date.now()}`;
  for (const it of items) {
    if ((it as any).kind === "part" && (it as any).partId && (it as any).qty) {
      await Repos.parts.movement({
        partId: (it as any).partId,
        type: "RESERVE",
        qty: (it as any).qty,
        reason: `Template ${templateId}`,
        ref: woId,
      });
    }
  }

  return { woId, quoteId, items };
}

