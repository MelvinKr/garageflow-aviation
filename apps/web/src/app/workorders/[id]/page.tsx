"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useMockState } from "@/store/mockState";
import { getAircraft, getParts, getSuppliers, getCustomers } from "@/lib/mock";
import WoStatusBadge from "@/components/WoStatusBadge";
import { useToast } from "@/components/ui/useToast";
import { buildWorkOrderHtml } from "@/lib/printWo";
import { openPrint } from "@/lib/openPrint";

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();

  const { workorders, toggleTaskDone, setWoStatus, computeMissingForTask, movements, toggleTaskTimer, addTaskHours, setTaskRate, addAttachment, removeAttachment } = useMockState();
  const wo = workorders.find((w) => w.id === id);

  const parts = getParts();
  const aircraft = getAircraft();
  const customers = getCustomers();
  const suppliers = getSuppliers();

  const plane = useMemo(() => aircraft.find((a) => a.id === wo?.aircraftId), [wo, aircraft]);
  const customer = useMemo(() => customers.find((c) => c.id === plane?.ownerId), [plane, customers]);

  const [note, setNote] = useState("");

  if (!wo) return <section className="p-6 text-sm text-gray-500">WO introuvable.</section>;

  // résumé pièces (besoins vs stock)
  const partsSummary = useMemo(() => {
    const map = new Map<string, { label: string; need: number; reserved: number; avail: number; missing: number; supplier?: string }>();
    for (const t of wo.tasks) {
      if (!t.partId || !t.qty) continue;
      const p = parts.find((x) => x.id === t.partId);
      const need = Number(t.qty ?? 0);
      const reserved = Number(p?.reservedQty ?? 0);
      const avail = Math.max(0, Number(p?.qty ?? 0) - reserved);
      const missing = Math.max(0, need - avail);
      const key = t.partId;
      const prev = map.get(key);
      const label = p ? `${p.sku} — ${p.name}` : t.partId;
      const supplier = p ? suppliers.find((s) => s.id === p.supplierId)?.name : undefined;
      if (!prev) map.set(key, { label, need, reserved, avail, missing, supplier });
      else map.set(key, { ...prev, need: prev.need + need, missing: prev.missing + missing });
    }
    return Array.from(map.entries()).map(([partId, v]) => ({ partId, ...v }));
  }, [wo, parts, suppliers]);

  // activité liée (mouvements partId + ref = WO id)
  const activity = useMemo(
    () =>
      movements
        .filter((m) => m.ref === wo.id || wo.tasks.some((t) => t.partId === m.partId))
        .slice(0, 30),
    [movements, wo]
  );

  const tasksDone = wo.tasks.filter((t) => t.done).length;

  const labor = useMemo(() => {
    let hours = 0, cost = 0;
    for (const t of wo.tasks) {
      const h = t.hours ?? 0;
      const r = t.rate ?? 95;
      hours += h;
      cost += h * r;
    }
    return { hours, cost };
  }, [wo.tasks]);

  function MockUpload({ onUpload }: { onUpload: (url: string, kind: "photo"|"doc") => void }) {
    return (
      <div className="flex gap-2">
        <button
          className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
          onClick={() => {
            const url = `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/600/400`;
            onUpload(url, "photo");
          }}
        >
          + Photo
        </button>
        <button
          className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
          onClick={() => {
            const url = "https://example.com/documents/rapport.pdf";
            onUpload(url, "doc");
          }}
        >
          + Document
        </button>
      </div>
    );
  }

  function buildPOmailto(partId: string, qtyWanted: number) {
    const p = parts.find((x) => x.id === partId);
    if (!p) return "#";
    const supplier = suppliers.find((s) => s.id === p.supplierId);
    const email = supplier?.email ?? "orders@example.com";
    const subject = encodeURIComponent(`Commande ${p.sku} – ${p.name} (WO ${wo.id})`);
    const body = encodeURIComponent(
`Bonjour,

Merci de nous confirmer la dispo et le délai sur:
- SKU: ${p.sku}
- Nom: ${p.name}
- Quantité souhaitée: ${qtyWanted}
- Réf: WO ${wo.id}

Livraison: Aéroport TFFJ, Saint-Barthélemy
Client/Avion: ${plane?.reg ?? wo.aircraftId} — ${plane?.type ?? ""}

Cordialement,
GarageFlow Aviation`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">WO {wo.id}</h1>
          <div className="text-sm text-gray-600">
            Avion: <b>{plane ? `${plane.reg} — ${plane.type}` : wo.aircraftId}</b> • Client: <b>{customer?.name ?? "—"}</b> • Statut: <WoStatusBadge status={wo.status} />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ouvert le {new Date(wo.openedAt).toLocaleString()}
            {wo.closedAt && <> • Clos le {new Date(wo.closedAt).toLocaleString()}</>}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm" onClick={() => openPrint(buildWorkOrderHtml(wo))}>
            PDF
          </button>
          {wo.status !== "closed" && (
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
              onClick={() => {
                if (wo.tasks.some((t) => !t.done)) {
                  const missing = wo.tasks.filter((t) => !t.done).length;
                  push({ type: "error", message: missing > 1 ? `Termine toutes les tâches avant de clore.` : `Termine la tâche restante avant de clore.` });
                  return;
                }
                setWoStatus(wo.id, "closed");
                push({ type: "success", message: "WO clôturé." });
              }}
            >
              Clore
            </button>
          )}
          <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm" onClick={() => router.push("/workorders")}>
            Retour
          </button>
        </div>
      </div>

      {/* Tâches */}
      <div className="border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Fait</th>
              <th className="px-3 py-2 text-left">Tâche</th>
              <th className="px-3 py-2 text-left">Pièce</th>
              <th className="px-3 py-2 text-left">Qté</th>
              <th className="px-3 py-2 text-left">Dispo (min)</th>
              <th className="px-3 py-2 text-left">Note</th>
              <th className="px-3 py-2 text-left">Heures</th>
              <th className="px-3 py-2 text-left">€/h</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wo.tasks.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={7}>
                  Aucune tâche
                </td>
              </tr>
            ) : (
              wo.tasks.map((t) => {
                const p = t.partId ? parts.find((x) => x.id === t.partId) : null;
                const miss = computeMissingForTask(t);
                const dispoStr = p ? `${Math.max(0, (p.qty ?? 0) - (p.reservedQty ?? 0))} / min ${p.minQty ?? 0}` : "—";
                return (
                  <tr key={t.id} className="border-t">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => {
                          toggleTaskDone(wo.id, t.id);
                          push({ type: "info", message: t.done ? "Tâche réouverte" : "Tâche complétée" });
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">{t.label}</td>
                    <td className="px-3 py-2">{p ? `${p.sku} — ${p.name}` : t.partId ?? "—"}</td>
                    <td className="px-3 py-2">{t.qty ?? "—"}</td>
                    <td className={`px-3 py-2 ${miss.missing > 0 ? "text-red-600 font-semibold" : ""}`}>{dispoStr}</td>
                    <td className="px-3 py-2">
                      {/* note locale simple (mock) */}
                      <input
                        className="border rounded px-2 py-1 text-sm w-56"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ajouter une note rapide…"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className={`px-2 py-0.5 text-xs rounded border ${t.running ? "bg-green-50" : "hover:bg-gray-50"}`}
                          onClick={() => {
                            toggleTaskTimer(wo.id, t.id);
                            push({ type: "info", message: t.running ? "Timer arrêté" : "Timer démarré" });
                          }}
                        >
                          {t.running ? "Stop" : "Start"}
                        </button>
                        <button
                          className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50"
                          onClick={() => addTaskHours(wo.id, t.id, 0.25)}
                          title="+15 min"
                        >
                          +0.25h
                        </button>
                        <input
                          type="number"
                          className="border rounded px-2 py-1 text-sm w-20"
                          value={t.hours ?? 0}
                          onChange={(e) => addTaskHours(wo.id, t.id, Number(e.target.value) - (t.hours ?? 0))}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 text-sm w-20"
                        value={t.rate ?? 95}
                        onChange={(e) => setTaskRate(wo.id, t.id, Number(e.target.value))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {miss.missing > 0 && p && (
                        <a className="text-blue-600 underline" href={buildPOmailto(p.id, Math.max(miss.missing, p.minQty ?? 1))}>
                          Commander ({miss.missing})
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* RISK BANNER */}
      {(partsSummary.some((p) => p.missing > 0) || (plane?.nextDue?.dueAtHours && plane?.hours && (plane as any).nextDue.dueAtHours - (plane as any).hours < 50)) && (
        <div className="border border-yellow-300 bg-yellow-50 text-yellow-900 px-3 py-2 rounded">
          <b>Risques:</b>
          {partsSummary.some((p) => p.missing > 0) && <span className="ml-2">• Pièces manquantes à commander</span>}
          {(plane?.nextDue?.dueAtHours && plane?.hours && (plane as any).nextDue.dueAtHours - (plane as any).hours < 50) && (
            <span className="ml-2">• Inspection avion bientôt due ({Math.max(0, (plane as any).nextDue.dueAtHours - (plane as any).hours).toFixed(0)} h)</span>
          )}
        </div>
      )}

      {/* Attachments */}
      <div>
        <h3 className="font-medium mb-2">Pièces jointes</h3>
        <div className="flex gap-2 mb-2">
          <MockUpload
            onUpload={(fileUrl, kind) => {
              addAttachment(wo.id, { url: fileUrl, kind, label: kind === "photo" ? "Photo atelier" : "Document" });
              push({ type: "success", message: "Pièce jointe ajoutée" });
            }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(wo.attachments ?? []).length === 0 ? (
            <div className="text-sm text-gray-500">Aucune pièce jointe</div>
          ) : (
            (wo.attachments ?? []).map((att) => (
              <div key={att.id} className="border rounded p-2">
                {att.kind === "photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={att.label ?? "photo"} src={att.url} className="w-full h-32 object-cover rounded" />
                ) : (
                  <a href={att.url} target="_blank" className="underline">{att.label ?? "Document"}</a>
                )}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <span>{att.kind}</span>
                  <button className="underline" onClick={() => removeAttachment(wo.id, att.id)}>Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Résumé pièces */}
      <div>
        <h3 className="font-medium mb-2">Résumé pièces</h3>
        <div className="border rounded overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Pièce</th>
                <th className="px-3 py-2 text-left">Fournisseur</th>
                <th className="px-3 py-2 text-left">Besoin</th>
                <th className="px-3 py-2 text-left">Réservé</th>
                <th className="px-3 py-2 text-left">Disponible</th>
                <th className="px-3 py-2 text-left">Manquant</th>
              </tr>
            </thead>
            <tbody>
              {partsSummary.length === 0 ? (
                <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>—</td></tr>
              ) : partsSummary.map((r) => (
                <tr key={r.partId} className="border-t">
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2">{r.supplier ?? "—"}</td>
                  <td className="px-3 py-2">{r.need}</td>
                  <td className="px-3 py-2">{r.reserved}</td>
                  <td className="px-3 py-2">{r.avail}</td>
                  <td className={`px-3 py-2 ${r.missing > 0 ? "text-red-600 font-semibold" : ""}`}>{r.missing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Journal d'activité */}
      <div>
        <h3 className="font-medium mb-2">Activité récente</h3>
        <div className="border rounded overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Quand</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Pièce</th>
                <th className="px-3 py-2 text-left">Qté</th>
                <th className="px-3 py-2 text-left">Réf</th>
                <th className="px-3 py-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {activity.length === 0 ? (
                <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>Aucune activité</td></tr>
              ) : activity.map((m) => {
                const p = parts.find((x) => x.id === m.partId);
                return (
                  <tr key={m.id} className="border-t">
                    <td className="px-3 py-2">{new Date(m.at).toLocaleString()}</td>
                    <td className="px-3 py-2">{m.type}</td>
                    <td className="px-3 py-2">{p ? `${p.sku} — ${p.name}` : m.partId}</td>
                    <td className="px-3 py-2">{m.qty}</td>
                    <td className="px-3 py-2">{m.ref ?? "—"}</td>
                    <td className="px-3 py-2">{m.note ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer mini résumé */}
      <div className="text-sm text-gray-600">
        Tâches terminées: <b>{tasksDone}/{wo.tasks.length}</b> • MO: <b>{labor.hours.toFixed(2)} h</b> (~ <b>{labor.cost.toFixed(2)} €</b>)
      </div>
    </section>
  );
}
