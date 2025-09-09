"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMockState } from "@/store/mockState";
import { getParts, getSuppliers } from "@/lib/mock";
import { useToast } from "@/components/ui/useToast";

export default function PoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const { purchaseOrders, receivePoItem, updatePO } = useMockState();
  const po = purchaseOrders.find((p) => p.id === id);
  const parts = getParts();
  const suppliers = getSuppliers();
  const supplier = suppliers.find((s) => s.id === po?.supplierId);

  if (!po) return <section className="p-6 text-sm text-gray-500">PO introuvable.</section>;

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">PO {po.id}</h1>
          <div className="text-sm text-gray-600">Fournisseur: <b>{supplier?.name ?? po.supplierId}</b> • Créé le {new Date(po.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          {po.status !== "received" && (
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50" onClick={() => { updatePO(po.id, { status: "received" }); push({ type: "success", message: "PO marqué reçu" }); }}>
              Marquer tout reçu
            </button>
          )}
          <Link href="/purchase-orders" className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Retour</Link>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Pièce</th>
              <th className="px-3 py-2 text-left">Qté commandée</th>
              <th className="px-3 py-2 text-left">PU estimé</th>
              <th className="px-3 py-2 text-left">Réception</th>
            </tr>
          </thead>
          <tbody>
            {po.items.length === 0 ? (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Aucune ligne</td></tr>
            ) : po.items.map((it) => {
              const p = parts.find((x) => x.id === it.partId);
              return (
                <tr key={it.id} className="border-t">
                  <td className="px-3 py-2">{p ? `${p.sku} — ${p.name}` : it.partId}</td>
                  <td className="px-3 py-2">{it.qty}</td>
                  <td className="px-3 py-2">{(it.unitCost ?? p?.unitCost ?? 0).toFixed(2)} €</td>
                  <td className="px-3 py-2">
                    <form className="flex items-center gap-2" action={(fd: FormData) => {
                      const qty = Number(fd.get("q"));
                      if (!Number.isFinite(qty) || qty <= 0) { push({ type: "error", message: "Qté invalide" }); return; }
                      receivePoItem(po.id, it.id, qty);
                      push({ type: "success", message: `Reçu ${qty} ${p?.sku ?? ""}` });
                    }}>
                      <input type="number" name="q" step="1" min="1" defaultValue={it.qty} className="border rounded px-2 py-1 w-24" />
                      <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Recevoir</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

