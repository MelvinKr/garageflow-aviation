"use client";
import { useEffect } from "react";

type Part = {
  id: string;
  sku: string;
  name: string;
  category: string;
  cert: string;
  unitCost: number;
  qty: number;
  minQty: number;
  location: string;
  supplierId?: string;
  trace?: { batch?: string; serial?: string | null; expiry?: string | null };
};

export function PartDrawer({
  part,
  onClose,
  onSave,
}: {
  part: Part | null;
  onClose: () => void;
  onSave: (updated: Part) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (part) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [part, onClose]);

  if (!part) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Détails pièce</h2>
          <button onClick={onClose} className="text-sm underline">
            Fermer
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <Row label="Réf / SKU" value={`${part.id} — ${part.sku}`} />
          <Row label="Nom" value={part.name} />
          <Row label="Catégorie" value={part.category} />
          <Row label="Certificat" value={part.cert} />
          <Row label="Fournisseur" value={part.supplierId ?? "—"} />
          <Row label="Emplacement" value={part.location} />
          <Row label="Quantité (min)" value={`${part.qty} (${part.minQty})`} />
          <Row label="Coût unitaire" value={`${part.unitCost} CAD`} />
          {part.trace && (
            <div className="grid grid-cols-2 gap-3">
              <Field title="Batch" value={part.trace.batch} />
              <Field title="N° série" value={part.trace.serial ?? "—"} />
              <Field title="Péremption" value={part.trace.expiry ?? "—"} />
            </div>
          )}
        </div>

        <div className="mt-6 space-x-3">
          <button
            onClick={() => onSave({ ...part, qty: part.qty + 1 })}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            + Entrée (mock)
          </button>
          <button
            onClick={() => onSave({ ...part, qty: Math.max(0, part.qty - 1) })}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            − Sortie (mock)
          </button>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-36 text-neutral-500">{label}</div>
      <div className="flex-1">{value}</div>
    </div>
  );
}

function Field({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="text-sm font-medium">{value}</div>
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
