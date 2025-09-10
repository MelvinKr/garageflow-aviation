"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Row = { id: string; status: string; total_amount: number | null };

export default function QuotesClient({
  rows,
  createAction,
  updateAction,
}: {
  rows: Row[];
  createAction: (formData: FormData) => Promise<any>;
  updateAction: (formData: FormData) => Promise<any>;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const current = useMemo(() => rows.find((r) => r.id === openId) || null, [rows, openId]);
  const [status, setStatus] = useState<string>("draft");
  const [total, setTotal] = useState<string>("0");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (current) {
      setStatus(String(current.status || "draft"));
      setTotal(String(current.total_amount ?? 0));
    }
  }, [current?.id]);

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Devis</h1>
        <form action={async (fd) => {
          await createAction(fd);
          startTransition(() => router.refresh());
        }}>
          <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Nouveau devis</button>
        </form>
      </div>

      <div className="border rounded overflow-hidden bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Devis #</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Aucun devis</td></tr>
            ) : rows.map((q) => (
              <tr key={q.id} className="border-t">
                <td className="px-3 py-2">{q.id}</td>
                <td className="px-3 py-2">{q.status}</td>
                <td className="px-3 py-2">{Number(q.total_amount ?? 0).toFixed(2)}</td>
                <td className="px-3 py-2">
                  <button className="px-2 py-1 border rounded text-xs hover:bg-gray-50" onClick={() => setOpenId(q.id)}>Éditer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && current && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-5 space-y-4 border shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Éditer le devis {current.id}</h2>
              <button onClick={() => setOpenId(null)} className="text-sm underline">Fermer</button>
            </div>

            <form action={async (fd) => {
              await updateAction(fd);
              setOpenId(null);
              startTransition(() => router.refresh());
            }} className="grid gap-3 text-sm">
              <input type="hidden" name="id" value={current.id} />

              <label className="grid gap-1">
                <span className="text-gray-500">Statut</span>
                <select name="status" className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="draft">brouillon</option>
                  <option value="sent">envoyé</option>
                  <option value="accepted">accepté</option>
                  <option value="rejected">refusé</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-gray-500">Total</span>
                <input name="total_amount" type="number" step="0.01" className="border rounded px-2 py-1" value={total} onChange={(e) => setTotal(e.target.value)} />
              </label>

              <div className="flex gap-2">
                <button disabled={isPending} className="px-3 py-1 rounded bg-black text-white hover:opacity-90 disabled:opacity-60">{isPending ? "Sauvegarde…" : "Sauvegarder"}</button>
                <button type="button" onClick={() => setOpenId(null)} className="px-3 py-1 rounded border hover:bg-gray-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

