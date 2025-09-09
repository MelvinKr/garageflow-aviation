"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMockState } from "@/store/mockState";
import { getAircraft, getCustomers, getParts } from "@/lib/mock";
import WoStatusBadge from "@/components/WoStatusBadge";

function partsCostForWo(wo: any, parts: any[]) {
  let total = 0;
  for (const t of wo.tasks) {
    if (t.done && t.partId && t.qty) {
      const p = parts.find((x) => x.id === t.partId);
      if (p) total += (p.unitCost ?? 0) * (t.qty ?? 0);
    }
  }
  return total;
}

export default function WorkOrdersPage() {
  const [filter, setFilter] = useState<"all" | "in_progress" | "closed">("all");
  const workorders = useMockState((s) => s.workorders);
  const parts = getParts();
  const aircraft = getAircraft();
  const customers = getCustomers();

  const rows = useMemo(() => {
    const base = workorders.map((w) => {
      const a = aircraft.find((x) => x.id === w.aircraftId);
      const c = customers.find((y) => y.id === a?.ownerId);
      const done = w.tasks.filter((t) => t.done).length;
      const progress = w.tasks.length ? Math.round((done / w.tasks.length) * 100) : 0;
      const partsCost = partsCostForWo(w, parts);
      return {
        ...w,
        aircraftLabel: a ? `${a.reg} — ${a.type}` : w.aircraftId,
        customerName: c?.name ?? "—",
        done,
        progress,
        partsCost,
      };
    });
    return base.filter((r) => (filter === "all" ? true : r.status === filter));
  }, [workorders, aircraft, customers, parts, filter]);

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Réparations en cours</h1>
        <div className="flex gap-1 text-sm">
          {(["all", "in_progress", "closed"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1 rounded border ${filter === k ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              {k === "all" ? "Tous" : k.replace("_", " ")}
            </button>
          ))}
          <button
            className="ml-3 px-3 py-1 border rounded text-sm hover:bg-gray-50"
            onClick={() => {
              const data = rows.map((r: any) => ({ id: r.id, aircraft: r.aircraftLabel, status: r.status, progress: `${r.progress}%` }));
              downloadCSV("workorders.csv", toCSV(data));
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">WO #</th>
              <th className="px-3 py-2 text-left">Avion</th>
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-left">Ouvert</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Progress</th>
              <th className="px-3 py-2 text-left">Coût pièces (consommées)</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={7}>
                  Rien à afficher.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link href={`/workorders/${r.id}`} className="text-blue-600 underline">
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{r.aircraftLabel}</td>
                  <td className="px-3 py-2">{r.customerName}</td>
                  <td className="px-3 py-2">{new Date(r.openedAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <WoStatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-40 h-2 bg-gray-200 rounded">
                      <div className="h-2 bg-blue-500 rounded" style={{ width: `${r.progress}%` }} />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {r.done}/{r.tasks.length} ({r.progress}%)
                    </div>
                  </td>
                  <td className="px-3 py-2">{r.partsCost.toFixed(2)} €</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
