"use client";

import { useMemo } from "react";
import { getAircraft, getCustomers } from "@/lib/mock";

export default function AircraftDrawer({
  id,
  onClose,
}: { id: string; onClose: () => void }) {
  const aircraft = getAircraft();
  const customers = getCustomers();
  const plane = useMemo(() => aircraft.find((a: any) => a.id === id), [id, aircraft]);
  const owner = (customers as any[]).find((c) => c.id === plane?.ownerId);

  if (!plane) return null;

  const due =
    plane.nextDue?.dueAtHours != null
      ? `${Math.max(0, plane.nextDue.dueAtHours - plane.hours).toFixed(1)} h`
      : (plane.nextDue?.dueDate ?? "—");

  return (
    <div className="fixed right-0 top-0 h-full w-[520px] bg-white border-l shadow-xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Avion {plane.reg}</h2>
        <button onClick={onClose} className="text-sm underline">Fermer</button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <LabelItem label="Immat.">{plane.reg}</LabelItem>
        <LabelItem label="Type">{plane.type}</LabelItem>
        <LabelItem label="Heures">{plane.hours}</LabelItem>
        <LabelItem label="Cycles">{plane.cycles ?? "—"}</LabelItem>
        <LabelItem label="Base">{plane.base ?? "—"}</LabelItem>
        <LabelItem label="Entretien à venir">{due}</LabelItem>
        <LabelItem label="Propriétaire">{owner?.name ?? plane.ownerId}</LabelItem>
        <LabelItem label="Email propriétaire">{owner?.email ?? "—"}</LabelItem>
        <LabelItem label="Téléphone">{owner?.phone ?? "—"}</LabelItem>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Liens (placeholders)</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Devis récents: (à venir en Phase 3)</li>
          <li>Work Orders: (à venir en Phase 3)</li>
          <li>Historique révisions: (Phase 6)</li>
        </ul>
      </div>
    </div>
  );
}

function LabelItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  );
}

