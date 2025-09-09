"use client";

import { useRouter } from "next/navigation";
import { useMockState } from "@/store/mockState";
import { getSuppliers, getParts } from "@/lib/mock";
import { useState } from "react";

export default function NewPOPage() {
  const router = useRouter();
  const { createPO } = useMockState();
  const suppliers = getSuppliers();
  const parts = getParts();
  const [supplierId, setSupplier] = useState(suppliers[0]?.id ?? "SUP-001");
  const [rows, setRows] = useState([{ partId: parts[0]?.id ?? "", qty: 1 }]);

  function addRow() {
    setRows((r) => [...r, { partId: parts[0]?.id ?? "", qty: 1 }]);
  }

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Nouveau PO</h1>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
        <label className="grid gap-1 text-sm">
          <span className="text-gray-500">Fournisseur</span>
          <select className="border rounded px-2 py-1" value={supplierId} onChange={(e) => setSupplier(e.target.value)}>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border rounded overflow-hidden w-full max-w-3xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Pièce</th>
              <th className="px-3 py-2 text-left">Qté</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={r.partId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRows(rows.map((x, i) => (i === idx ? { ...x, partId: v } : x)));
                    }}
                  >
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-28"
                    value={r.qty}
                    min={1}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setRows(rows.map((x, i) => (i === idx ? { ...x, qty: v } : x)));
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50" onClick={addRow}>
          + Ligne
        </button>
        <button
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
          onClick={() => {
            const poId = createPO({ supplierId, items: rows.map((r) => ({ partId: r.partId, qty: r.qty })) });
            router.push(`/purchase-orders/${poId}`);
          }}
        >
          Créer
        </button>
      </div>
    </section>
  );
}

