"use client";

import { useEffect, useMemo, useState } from "react";
import { useMockState, Part } from "@/store/mockState";
import suppliers from "@/mock/suppliers.json";
import PartLinks from "@/components/PartLinks";
import { uploadPublic } from "@/lib/storage";
import { useToast } from "@/components/ui/useToast";

type Props = { id: string; onClose: () => void };

function Labeled({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="text-sm grid gap-1">
      <span className="text-gray-500">{label}</span>
      {children}
    </label>
  );
}

export function PartDrawer({ id, onClose }: Props) {
  const { parts, updatePart } = useMockState();
  const { push } = useToast();
  const original = useMemo(() => parts.find((p) => p.id === id), [parts, id]);
  const [draft, setDraft] = useState<Partial<Part> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  useEffect(() => {
    if (original) {
      setDraft({ ...original } as any);
    }
  }, [original?.id]);

  if (!original || !draft) return null;

  const supplier = (suppliers as any[]).find((s) => s.id === (draft as any).supplierId);
  const qty = Number(draft.qty ?? 0);
  const reserved = Number((draft as any).reservedQty ?? 0);
  const min = Number(draft.minQty ?? 0);
  const dispo = qty - reserved;

  function set<K extends keyof Part>(key: K, value: Part[K]) {
    setDraft((d) => ({ ...(d as any), [key]: value }) as any);
  }

  function buildMailTo() {
    const email = supplier?.email ?? "orders@example.com";
    const subject = encodeURIComponent(`Commande ${draft.sku} - ${draft.name}`);
    const suggest = Math.max(min * 2 - dispo, min - dispo + 1, 1);
    const body = encodeURIComponent(
      `Bonjour,

Merci de nous confirmer la dispo et le délai sur l'article:
- SKU: ${draft.sku}
- Nom: ${draft.name}
- Certification: ${(draft as any).cert ?? "-"}
- Quantité souhaitée: ${suggest}

Adresse de livraison: [votre adresse]
Conditions: [NET30 / DUE_ON_RECEIPT]
Réf. interne: ${draft.id}

Cordialement,
GarageFlow Aviation`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  async function onSave() {
    setSaving(true);
    try {
      const patch: any = { ...(draft as any) };
      if (photoFile) {
        try {
          setUploading(true);
          const url = await uploadPublic("parts", photoFile, String((draft as any).sku ?? original.sku));
          patch.photoUrl = url;
        } catch (e: any) {
          push({ type: "error", message: e?.message ?? "Upload photo échoué" });
        } finally {
          setUploading(false);
        }
      }
      if (certFile) {
        try {
          setUploading(true);
          const url = await uploadPublic("certs", certFile, String((draft as any).sku ?? original.sku));
          patch.certUrl = url;
        } catch (e: any) {
          push({ type: "error", message: e?.message ?? "Upload certificat échoué" });
        } finally {
          setUploading(false);
        }
      }
      updatePart(original.id, patch as any);
      push({ type: "success", message: "Pièce sauvegardée" });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    setDraft({ ...original } as any);
    onClose();
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[520px] bg-white border-l shadow-xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Détails pièce</h2>
        <button onClick={onClose} className="text-sm underline">Fermer</button>
      </div>

      {/* Photo */}
      <div className="mb-5">
        <div className="text-sm text-gray-500 mb-2">Photo</div>
        {(draft as any).photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={(draft as any).photoUrl as any} alt={String(draft.name)} className="w-full h-40 object-cover rounded border" />
        ) : (
          <div className="w-full h-40 grid place-items-center border rounded text-gray-400">Aucune photo</div>
        )}
        <label className="mt-2 inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          <span className="px-3 py-1 rounded border hover:bg-gray-50">{uploading ? "Téléversement..." : "Joindre/Changer photo"}</span>
          {photoFile && <span className="text-xs text-gray-600">{photoFile.name}</span>}
        </label>
      </div>

      {/* Champs (brouillon) */}
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Réf / SKU"><div className="text-sm">{draft.id} — {draft.sku}</div></Labeled>
        <Labeled label="Nom"><input className="border rounded px-2 py-1" value={String(draft.name ?? "")} onChange={(e)=>set("name", e.target.value as any)} /></Labeled>
        <Labeled label="Catégorie"><input className="border rounded px-2 py-1" value={String(draft.category ?? "")} onChange={(e)=>set("category", e.target.value as any)} /></Labeled>
        <Labeled label="Certificat"><input className="border rounded px-2 py-1" value={String((draft as any).cert ?? "")} onChange={(e)=>set("cert" as any, e.target.value as any)} /></Labeled>
        <Labeled label="Lien certificat (URL)"><input className="border rounded px-2 py-1" value={String((draft as any).certUrl ?? "")} onChange={(e)=>set("certUrl" as any, e.target.value as any)} /></Labeled>
        <Labeled label="Fournisseur">
          <select className="border rounded px-2 py-1" value={String((draft as any).supplierId ?? "")} onChange={(e)=>set("supplierId", e.target.value as any)}>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Labeled>
        <Labeled label="Emplacement"><input className="border rounded px-2 py-1" value={String(draft.location ?? "")} onChange={(e)=>set("location", e.target.value as any)} /></Labeled>
        <Labeled label="Quantité"><input type="number" className="border rounded px-2 py-1" value={qty} onChange={(e)=>set("qty", Number(e.target.value) as any)} /></Labeled>
        <Labeled label="Réservée"><input type="number" className="border rounded px-2 py-1" value={reserved} onChange={(e)=>set("reservedQty", Number(e.target.value) as any)} /></Labeled>
        <Labeled label="Min"><input type="number" className="border rounded px-2 py-1" value={min} onChange={(e)=>set("minQty", Number(e.target.value) as any)} /></Labeled>
        <Labeled label="Coût unitaire (CAD)"><input type="number" className="border rounded px-2 py-1" value={Number(draft.unitCost ?? 0)} onChange={(e)=>set("unitCost", Number(e.target.value) as any)} /></Labeled>
      </div>

      {/* Statut + actions */}
      <div className="mt-4 text-sm">Disponible: <b className={dispo <= min ? "text-red-600" : ""}>{dispo}</b> (min {min})</div>
      <div className="mt-6 flex flex-wrap gap-2 items-center">
        <a href={buildMailTo()} className="px-3 py-1 rounded border hover:bg-gray-50">Commander</a>
        {supplier?.email && (<a href={`mailto:${supplier.email}`} className="px-3 py-1 rounded border hover:bg-gray-50">Contacter fournisseur</a>)}
        {(draft as any).certUrl && (<a href={(draft as any).certUrl as any} target="_blank" className="px-3 py-1 rounded border hover:bg-gray-50">Voir certificat</a>)}
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setCertFile(e.target.files?.[0] ?? null)} />
          <span className="px-3 py-1 rounded border hover:bg-gray-50">Joindre/Changer certificat</span>
          {certFile && <span className="text-xs text-gray-600">{certFile.name}</span>}
        </label>
      </div>

      {/* Liens cross-refs */}
      <PartLinks partId={original.id} />

      {/* Boutons Sauvegarder / Annuler */}
      <div className="mt-6 flex gap-2">
        <button onClick={onSave} disabled={saving} className="px-3 py-1 rounded bg-black text-white hover:opacity-90 disabled:opacity-50">{saving ? "Sauvegarde..." : "Sauvegarder les modifs"}</button>
        <button onClick={onCancel} className="px-3 py-1 rounded border hover:bg-gray-50">Annuler</button>
      </div>
    </div>
  );
}

