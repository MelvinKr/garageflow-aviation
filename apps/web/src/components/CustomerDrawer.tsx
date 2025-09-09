"use client";

import { useMemo } from "react";
import { getCustomers, getAircraft } from "@/lib/mock";

export default function CustomerDrawer({
  id,
  onClose,
}: { id: string; onClose: () => void }) {
  const customers = getCustomers();
  const aircraft = getAircraft();
  const customer = useMemo(() => (customers as any[]).find((c) => c.id === id), [id, customers]);

  if (!customer) return null;

  const planes = (aircraft as any[]).filter((a) => a.ownerId === customer.id);

  return (
    <div className="fixed right-0 top-0 h-full w-[520px] bg-white border-l shadow-xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Client — {customer.name}</h2>
        <button onClick={onClose} className="text-sm underline">Fermer</button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <LabelItem label="Contact">{customer.contact ?? "—"}</LabelItem>
        <LabelItem label="Email">{customer.email ?? "—"}</LabelItem>
        <LabelItem label="Téléphone">{customer.phone ?? "—"}</LabelItem>
        <LabelItem label="Conditions">{customer.terms ?? "—"}</LabelItem>
        <LabelItem label="Adresse"><div className="whitespace-pre-line">{customer.address ?? "—"}</div></LabelItem>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Avions</h3>
        <div className="border rounded overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Immat.</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Heures</th>
                <th className="px-3 py-2 text-left">Base</th>
              </tr>
            </thead>
            <tbody>
              {planes.length === 0 ? (
                <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Aucun appareil</td></tr>
              ) : planes.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.reg}</td>
                  <td className="px-3 py-2">{p.type}</td>
                  <td className="px-3 py-2">{p.hours}</td>
                  <td className="px-3 py-2">{p.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Devis récents</h3>
        <p className="text-sm text-gray-500">À connecter en Phase 3.</p>
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

