"use client";

import { useState } from "react";
import { useMockState, Quote } from "@/store/mockState";
import { getCustomers, getAircraft, getParts } from "@/lib/mock";
import { computeTotals } from "@/lib/quote";
import { buildQuoteHtml } from "@/lib/printQuote";
import { openPrint } from "@/lib/openPrint";
import { useToast } from "@/components/ui/useToast";
import { useRouter } from "next/navigation";

export default function QuotesPage() {
  const { quotes, addQuote, updateQuote, removeQuote, acceptQuote } = useMockState();
  const { push } = useToast();
  const router = useRouter();
  const customers = getCustomers();
  const aircraft = getAircraft();
  const parts = getParts();

  const [editing, setEditing] = useState<Quote | null>(null);

  function newQuote() {
    const id = addQuote({
      customerId: customers[0]?.id ?? "CUST-001",
      aircraftId: aircraft[0]?.id ?? "AC-001",
      items: [],
    });
    const q = useMockState.getState().quotes.find((x) => x.id === id) || null;
    setEditing(q);
  }

  function openEdit(q: Quote) { setEditing(q); }
  function closeEdit() { setEditing(null); }

  function onAddPart() {
    if (!editing) return;
    const item = { id: crypto.randomUUID(), kind: "part" as const, label: "Pièce", qty: 1, unit: 100 };
    updateQuote(editing.id, { items: [item, ...editing.items] });
  }
  function onAddLabor() {
    if (!editing) return;
    const item = { id: crypto.randomUUID(), kind: "labor" as const, label: "Main d’œuvre", hours: 1, rate: 95 };
    updateQuote(editing.id, { items: [item, ...editing.items] });
  }

  function printable(q: Quote) {
    const c = customers.find((c) => c.id === q.customerId);
    const a = aircraft.find((x) => x.id === q.aircraftId);
    const tot = computeTotals(q.items, q.discountPct ?? 0);
    const html = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Devis ${q.id}</title>
          <style>
            body{font-family:Arial, sans-serif; padding:24px;}
            h1{margin:0 0 8px 0}
            table{width:100%; border-collapse:collapse; margin-top:12px}
            th,td{border:1px solid #ddd; padding:8px; font-size:12px}
            th{background:#f6f6f6; text-align:left}
            .right{text-align:right}
          </style>
        </head>
        <body>
          <h1>Devis ${q.id}</h1>
          <div>Client: <b>${c?.name ?? q.customerId}</b> — Avion: <b>${a?.reg ?? q.aircraftId}</b></div>
          <div>Date: ${new Date(q.createdAt).toLocaleString()}</div>
          <table>
            <thead><tr><th>Désignation</th><th>Qté/Heures</th><th>PU/Taux</th><th class="right">Montant</th></tr></thead>
            <tbody>
              ${q.items.map(it => {
                if (it.kind === 'part') {
                  const m = (it.qty ?? 0) * (it.unit ?? 0);
                  return `<tr><td>${it.label}</td><td>${it.qty ?? ''}</td><td>${it.unit ?? ''}</td><td class="right">${m.toFixed(2)}</td></tr>`
                } else {
                  const m = (it.hours ?? 0) * (it.rate ?? 95);
                  return `<tr><td>${it.label}</td><td>${it.hours ?? ''}</td><td>${it.rate ?? ''}</td><td class="right">${m.toFixed(2)}</td></tr>`
                }
              }).join('')}
            </tbody>
          </table>
          <div style="margin-top:12px; float:right;">
            <div>Sous-total: ${(tot.parts + tot.labor).toFixed(2)}</div>
            <div>Remise: -${(tot.discount).toFixed(2)}</div>
            <div>Taxes: ${tot.taxes.toFixed(2)}</div>
            <div style="font-weight:bold;">Total: ${tot.total.toFixed(2)}</div>
          </div>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Devis</h1>
        <button onClick={newQuote} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Nouveau devis</button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Devis #</th>
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-left">Avion</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>Aucun devis</td></tr>
            ) : quotes.map((q) => {
              const t = computeTotals(q.items, q.discountPct ?? 0);
              const cust = customers.find((c) => c.id === q.customerId)?.name ?? q.customerId;
              const reg = aircraft.find((a) => a.id === q.aircraftId)?.reg ?? q.aircraftId;
              return (
                <tr key={q.id} className="border-t">
                  <td className="px-3 py-2">{q.id}</td>
                  <td className="px-3 py-2">{cust}</td>
                  <td className="px-3 py-2">{reg}</td>
                  <td className="px-3 py-2">{q.status}</td>
                  <td className="px-3 py-2">{t.total.toFixed(2)}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button className="text-blue-600 underline" onClick={() => openEdit(q)}>Éditer</button>
                    <a className="text-blue-600 underline" href={`/api/quotes/${q.id}/pdf`} target="_blank" rel="noopener">Export PDF</a>
                    {q.status !== "accepted" && (
                      <button
                        className="text-green-600 underline"
                        onClick={() => {
                          try {
                            const { woId } = acceptQuote(q.id);
                            push({ type: "success", title: "Devis accepté", message: `WO créé: ${woId}` });
                            router.push(`/workorders/${woId}`);
                          } catch (e: any) {
                            push({ type: "error", title: "Erreur", message: e?.message ?? "Impossible d'accepter le devis" });
                          }
                        }}
                      >
                        Accepter
                      </button>
                    )}
                    <button className="text-red-600 underline" onClick={() => removeQuote(q.id)}>Suppr</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditQuoteModal
          quote={editing}
          onClose={closeEdit}
          onAddPart={onAddPart}
          onAddLabor={onAddLabor}
          onChange={(patch) => updateQuote(editing.id, patch)}
          parts={parts}
          customers={customers}
          aircraft={aircraft}
        />
      )}
    </section>
  );
}

function EditQuoteModal({
  quote, onClose, onAddPart, onAddLabor, onChange, parts, customers, aircraft
}: {
  quote: Quote; onClose: ()=>void; onAddPart: ()=>void; onAddLabor: ()=>void;
  onChange: (p: Partial<Quote>)=>void; parts: any[]; customers: any[]; aircraft: any[];
}) {
  const tot = computeTotals(quote.items, quote.discountPct ?? 0);
  function set<K extends keyof Quote>(k: K, v: Quote[K]) { onChange({ [k]: v } as any); }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Éditer le devis {quote.id}</h2>
          <button onClick={onClose} className="text-sm underline">Fermer</button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <label className="grid gap-1">
            <span className="text-gray-500">Client</span>
            <select className="border rounded px-2 py-1" value={quote.customerId} onChange={e=>set("customerId", e.target.value as any)}>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-gray-500">Avion</span>
            <select className="border rounded px-2 py-1" value={quote.aircraftId} onChange={e=>set("aircraftId", e.target.value as any)}>
              {aircraft.map((a: any) => <option key={a.id} value={a.id}>{a.reg} — {a.type}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-gray-500">Remise %</span>
            <input type="number" className="border rounded px-2 py-1" value={quote.discountPct ?? 0} onChange={e=>set("discountPct", Number(e.target.value) as any)} />
          </label>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm" onClick={onAddPart}>+ Pièce</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm" onClick={onAddLabor}>+ MO</button>
        </div>

        <div className="border rounded overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Désignation</th>
                <th className="px-3 py-2 text-left">Qté/Heures</th>
                <th className="px-3 py-2 text-left">PU/Taux</th>
                <th className="px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {quote.items.length === 0 ? (
                <tr><td className="px-3 py-3 text-gray-500" colSpan={5}>Aucune ligne</td></tr>
              ) : quote.items.map((it, idx) => (
                <tr key={it.id} className="border-t">
                  <td className="px-3 py-2">{it.kind === "part" ? "Pièce" : "MO"}</td>
                  <td className="px-3 py-2">
                    <input className="border rounded px-2 py-1 w-full" value={it.label}
                      onChange={e=>{
                        const items = [...quote.items];
                        items[idx] = { ...it, label: e.target.value };
                        onChange({ items });
                      }} />
                  </td>
                  <td className="px-3 py-2">
                    {it.kind === "part" ? (
                      <input type="number" className="border rounded px-2 py-1 w-24" value={it.qty ?? 1}
                        onChange={e=>{
                          const items = [...quote.items];
                          items[idx] = { ...it, qty: Number(e.target.value) };
                          onChange({ items });
                        }} />
                    ) : (
                      <input type="number" className="border rounded px-2 py-1 w-24" value={it.hours ?? 1}
                        onChange={e=>{
                          const items = [...quote.items];
                          items[idx] = { ...it, hours: Number(e.target.value) };
                          onChange({ items });
                        }} />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {it.kind === "part" ? (
                      <input type="number" className="border rounded px-2 py-1 w-28" value={it.unit ?? 0}
                        onChange={e=>{
                          const items = [...quote.items];
                          items[idx] = { ...it, unit: Number(e.target.value) };
                          onChange({ items });
                        }} />
                    ) : (
                      <input type="number" className="border rounded px-2 py-1 w-28" value={it.rate ?? 95}
                        onChange={e=>{
                          const items = [...quote.items];
                          items[idx] = { ...it, rate: Number(e.target.value) };
                          onChange({ items });
                        }} />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button className="text-red-600 underline" onClick={()=>{
                      const items = quote.items.filter(x => x.id !== it.id);
                      onChange({ items });
                    }}>Suppr</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm flex flex-col items-end gap-1">
          <div>Sous-total: {(tot.parts + tot.labor).toFixed(2)}</div>
          <div>Remise: -{tot.discount.toFixed(2)}</div>
          <div>Taxes: {tot.taxes.toFixed(2)}</div>
          <div className="font-semibold">Total: {tot.total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
