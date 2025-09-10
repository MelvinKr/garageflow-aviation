"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMockState } from "@/store/mockState";
import { getSuppliers } from "@/lib/mock";
import ManagerOnly from "@/components/ManagerOnly";

function statusColor(s: string) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    ordered: "bg-blue-50 text-blue-700 border-blue-200",
    partially_received: "bg-yellow-50 text-yellow-700 border-yellow-200",
    received: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return map[s] || "bg-gray-100 text-gray-700 border-gray-200";
}

export default function POListPage() {
  const pos = useMockState((s) => s.purchaseOrders);
  const suppliers = getSuppliers();

  const rows = useMemo(
    () =>
      pos.map((po) => ({
        ...po,
        supplierName: suppliers.find((s) => s.id === po.supplierId)?.name ?? po.supplierId,
        itemsCount: po.items.length,
      })),
    [pos, suppliers]
  );

  return (
    <ManagerOnly>
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bons de commande</h1>
        <Link href="/purchase-orders/new" className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
          Nouveau PO
        </Link>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">PO #</th>
              <th className="px-3 py-2 text-left">Fournisseur</th>
              <th className="px-3 py-2 text-left">Créé</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Lignes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={5}>
                  Aucun PO
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link className="text-blue-600 underline" href={`/purchase-orders/${r.id}`}>
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{r.supplierName}</td>
                  <td className="px-3 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${statusColor(r.status)}`}>
                      <span className="h-1.5 w-1.5 bg-current rounded-full" />
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.itemsCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
    </ManagerOnly>
  );
}
