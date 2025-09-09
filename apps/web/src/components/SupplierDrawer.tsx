"use client";

import { useMemo } from "react";
import { getSuppliers, getParts } from "@/lib/mock";

export default function SupplierDrawer({
  id,
  onClose,
}: { id: string; onClose: () => void }) {
  const suppliers = getSuppliers();
  const parts = getParts();
  const supplier = useMemo(() => (suppliers as any[]).find((s) => s.id === id), [id, suppliers]);

  if (!supplier) return null;

  const theirParts = (parts as any[]).filter((p) => p.supplierId === supplier.id);

  return (
    <div className="fixed right-0 top-0 h-full w-[520px] bg-white border-l shadow-xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Fournisseur — {supplier.name}</h2>
        <button onClick={onClose} className="text-sm underline">Fermer</button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <LabelItem label="Email">{supplier.email ?? "—"}</LabelItem>
        <LabelItem label="Téléphone">{supplier.phone ?? "—"}</LabelItem>
        <LabelItem label="Devise">{supplier.currency ?? "—"}</LabelItem>
        <LabelItem label="Lead time">{supplier.leadTimeDays ?? "—"} j</LabelItem>
        <LabelItem label="Adresse"><div className="whitespace-pre-line">{supplier.address ?? "—"}</div></LabelItem>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Pièces fournies</h3>
        <div className="border rounded overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Stock</th>
                <th className="px-3 py-2 text-left">Min</th>
              </tr>
            </thead>
            <tbody>
              {theirParts.length === 0 ? (
                <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Aucune pièce</td></tr>
              ) : theirParts.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.sku}</td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{(p.qty ?? 0) - (p.reservedQty ?? 0)}</td>
                  <td className="px-3 py-2">{p.minQty ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        {supplier.email && (
          <a href={`mailto:${supplier.email}`} className="px-3 py-1 rounded border hover:bg-gray-50 text-sm">
            Contacter
          </a>
        )}
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

