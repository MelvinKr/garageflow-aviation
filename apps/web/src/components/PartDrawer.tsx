"use client";
import { useEffect, useMemo, useState } from "react";
import { useMockState, mockUpload, Part as MockPart } from "@/store/mockState";
import suppliers from "@/mock/suppliers.json";

type Props = { id: string; onClose: () => void };

function InlineField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
}: {
  label: string;
  value: string | number | null | undefined;
  onChange?: (v: any) => void;
  type?: "text" | "number" | "select" | "link";
  placeholder?: string;
  options?: { value: string; label: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  const commit = () => {
    if (!onChange) return setEditing(false);
    onChange(type === "number" ? Number(draft) : draft);
    setEditing(false);
  };

  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-3">
      <div className="text-sm text-gray-500">{label}</div>
      {!editing ? (
        <div
          className={`min-h-[24px] ${onChange ? "cursor-pointer hover:underline" : ""}`}
          onClick={() => onChange && setEditing(true)}
          title={onChange ? "Cliquer pour éditer" : ""}
        >
          {type === "link" && value ? (
            <a href={String(value)} target="_blank" className="text-blue-600 underline">
              {value}
            </a>
          ) : (
            (value ?? "—").toString()
          )}
        </div>
      ) : type === "select" && options ? (
        <select
          className="w-full rounded border px-2 py-1"
          value={String(draft)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="w-full rounded border px-2 py-1"
          placeholder={placeholder}
          value={String(draft)}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? commit() : null)}
          onBlur={commit}
          autoFocus
        />
      )}
    </div>
  );
}

export function PartDrawer({ id, onClose }: Props) {
  const { parts, updatePart, movements, addMovement } = useMockState();
  const part = useMemo(() => parts.find((p) => p.id === id), [parts, id]);
  const [uploading, setUploading] = useState(false);

  const supplierOptions = (suppliers as any[]).map((s) => ({ value: s.id, label: s.name }));
  const supplier = (suppliers as any[]).find((s) => s.id === part?.supplierId);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!part) return null;

  const dispo = Number(part.qty ?? 0) - Number(part.reservedQty ?? 0);
  const min = Number(part.minQty ?? 0);
  const history = useMemo(
    () => movements.filter((m) => m.partId === part.id).sort((a, b) => (a.date > b.date ? -1 : 1)),
    [movements, part.id]
  );

  function buildMailTo(p: MockPart) {
    const email = supplier?.email ?? "orders@example.com";
    const subject = encodeURIComponent(`Commande ${p.sku} – ${p.name}`);
    const suggest = Math.max(min * 2 - dispo, min - dispo + 1, 1);
    const body = encodeURIComponent(`Bonjour,\n\nMerci de nous confirmer la dispo et le délai sur l’article:\n- SKU: ${p.sku}\n- Nom: ${p.name}\n- Certification: ${p.cert ?? "-"}\n- Quantité souhaitée: ${suggest}\n\nAdresse de livraison: [votre adresse]\nConditions: [NET30 / DUE_ON_RECEIPT]\nRéf. interne: ${p.id}\n\nCordialement,\nGarageFlow Aviation`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  async function onPhotoChoose(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await mockUpload(file);
      updatePart(part.id, { photoUrl: url } as any);
    } finally {
      setUploading(false);
    }
  }

  // Inline movement form state
  const [mvType, setMvType] = useState<"IN" | "OUT">("OUT");
  const [mvQty, setMvQty] = useState<number>(1);
  const [mvReason, setMvReason] = useState<string>("");
  const [mvErr, setMvErr] = useState<string>("");

  function addInlineMovement() {
    const qty = Math.abs(Number(mvQty) || 0);
    if (qty <= 0) {
      setMvErr("Quantité invalide");
      setTimeout(() => setMvErr(""), 2000);
      return;
    }
    // Avoid going negative
    if (mvType === "OUT" && qty > Number(part.qty ?? 0)) {
      setMvErr("Stock insuffisant");
      setTimeout(() => setMvErr(""), 2000);
      return;
    }
    addMovement({ partId: part.id, type: mvType, qty, reason: mvReason.trim() || undefined });
    setMvQty(1);
    setMvReason("");
  }

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-[460px] overflow-y-auto border-l bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Détails pièce</h2>
        <button onClick={onClose} className="text-sm underline">
          Fermer
        </button>
      </div>

      {/* Photo + Upload */}
      <div className="mb-5">
        <div className="mb-2 text-sm text-gray-500">Photo</div>
        {part.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={part.photoUrl as any} alt={part.name} className="h-40 w-full rounded border object-cover" />
        ) : (
          <div className="grid h-40 w-full place-items-center rounded border text-gray-400">Aucune photo</div>
        )}
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhotoChoose(e.target.files?.[0] || undefined)}
          />
          <span className="rounded border px-3 py-1 hover:bg-gray-50">{uploading ? "Téléversement..." : "Joindre/Changer photo"}</span>
        </label>
      </div>

      {/* Champs éditables inline */}
      <div className="space-y-3">
        <InlineField label="Réf / SKU" value={`${part.id} — ${part.sku}`} />
        <InlineField label="Nom" value={part.name} onChange={(v) => updatePart(part.id, { name: v } as any)} />
        <InlineField label="Catégorie" value={part.category} onChange={(v) => updatePart(part.id, { category: v } as any)} />
        <InlineField label="Certificat" value={part.cert} onChange={(v) => updatePart(part.id, { cert: v } as any)} />
        <InlineField
          label="Lien certificat"
          value={(part as any).certUrl}
          onChange={(v) => updatePart(part.id, { certUrl: v } as any)}
          type="link"
          placeholder="https://… (pdf/url)"
        />
        <InlineField
          label="Fournisseur"
          value={supplier?.name ?? part.supplierId}
          onChange={(v) => updatePart(part.id, { supplierId: v } as any)}
          type="select"
          options={supplierOptions}
        />
        <InlineField label="Emplacement" value={part.location} onChange={(v) => updatePart(part.id, { location: v } as any)} />
        <InlineField label="Quantité" value={part.qty} onChange={(v) => updatePart(part.id, { qty: Number(v) } as any)} type="number" />
        <InlineField label="Réservée" value={(part as any).reservedQty ?? 0} onChange={(v) => updatePart(part.id, { reservedQty: Number(v) } as any)} type="number" />
        <InlineField label="Min" value={part.minQty} onChange={(v) => updatePart(part.id, { minQty: Number(v) } as any)} type="number" />
        <InlineField label="Coût unitaire" value={part.unitCost} onChange={(v) => updatePart(part.id, { unitCost: Number(v) } as any)} type="number" />
      </div>

      {/* Statut stock */}
      <div className="mt-4 text-sm">
        <span className="mr-2 text-gray-500">Disponible:</span>
        <span className={dispo <= min ? "font-semibold text-red-600" : "font-medium"}>{dispo}</span>
        <span className="ml-2 text-gray-500"> (min {min})</span>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <a href={buildMailTo(part as any)} className="rounded border px-3 py-1 hover:bg-gray-50">
          Commander
        </a>
        {supplier?.email && (
          <a href={`mailto:${supplier.email}`} className="rounded border px-3 py-1 hover:bg-gray-50">
            Contacter fournisseur
          </a>
        )}
        {(part as any).certUrl && (
          <a href={(part as any).certUrl as any} target="_blank" className="rounded border px-3 py-1 hover:bg-gray-50">
            Voir certificat
          </a>
        )}
      </div>

      {/* Inline movement creation */}
      <div className="mt-6 rounded-lg border p-3">
        <div className="mb-2 text-sm font-medium">Ajouter un mouvement</div>
        {mvErr && <div className="mb-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">{mvErr}</div>}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select className="rounded border px-2 py-1" value={mvType} onChange={(e) => setMvType(e.target.value as any)}>
            <option value="IN">Entrée (+)</option>
            <option value="OUT">Sortie (−)</option>
          </select>
          <input
            type="number"
            min={1}
            value={mvQty}
            onChange={(e) => setMvQty(Number(e.target.value))}
            className="w-24 rounded border px-2 py-1"
          />
          <input
            type="text"
            placeholder="Motif (ex: utilisé sur WO-123)"
            value={mvReason}
            onChange={(e) => setMvReason(e.target.value)}
            className="min-w-[240px] flex-1 rounded border px-2 py-1"
          />
          <button onClick={addInlineMovement} className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
            Ajouter
          </button>
        </div>
      </div>

      {/* History */}
      <div className="mt-6">
        <div className="mb-2 text-sm font-medium">Historique des mouvements</div>
        {history.length === 0 ? (
          <div className="text-xs text-gray-500">Aucun mouvement enregistré.</div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-600">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Qté</th>
                  <th className="px-3 py-2">Motif</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2 text-gray-600">{new Date(m.date).toLocaleString()}</td>
                    <td className="px-3 py-2">{m.type}</td>
                    <td className="px-3 py-2">{m.type === "IN" ? "+" : "-"}{m.qty}</td>
                    <td className="px-3 py-2 text-gray-700">{m.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StockMovementForm({
  onSubmit,
}: {
  onSubmit: (p: { signedQty: number; reason: string; fileName?: string }) => void;
}) {
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [qty, setQty] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const signed = (type === "IN" ? 1 : -1) * Math.abs(Number(qty) || 0);
    if (signed === 0) return;
    onSubmit({ signedQty: signed, reason: reason.trim(), fileName });
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="text-sm font-medium">Mouvement stock</div>
      <div className="flex gap-2">
        <select
          className="rounded-md border px-2 py-1"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="IN">Entrée (+)</option>
          <option value="OUT">Sortie (−)</option>
        </select>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-24 rounded-md border px-2 py-1"
        />
      </div>
      <input
        placeholder="Motif (ex: réception fournisseur, consommation WO)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
      />
      <div>
        <input
          type="file"
          onChange={(e) => setFileName(e.target.files?.[0]?.name)}
          className="text-sm"
        />
        {fileName && <div className="text-xs text-gray-500 mt-1">Pièce jointe: {fileName}</div>}
      </div>
      <div className="pt-1">
        <button type="submit" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
          Enregistrer le mouvement
        </button>
      </div>
    </form>
  );
}
