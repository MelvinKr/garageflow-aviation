"use client";
import { useState } from "react";
import { addMovement } from "@/lib/movementStore";

export function StockMoveForm({
  partKey,
  currentQty,
  onSubmit,
}: {
  partKey: string;
  currentQty: number;
  onSubmit: (payload: { signedQty: number; reason: string; note?: string; attachmentUrl?: string }) => void;
}) {
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [qty, setQty] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(""), 2500);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const abs = Math.abs(Number(qty) || 0);
    if (abs === 0) return showError("Quantité invalide");
    if (type === "OUT" && abs > currentQty) return showError("Stock insuffisant");
    const signed = (type === "IN" ? 1 : -1) * abs;
    // record in-memory
    addMovement({ sku: partKey, delta: signed, reason, note, attachmentUrl, at: new Date().toISOString() });
    onSubmit({ signedQty: signed, reason, note, attachmentUrl });
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="text-sm font-medium">Mouvement stock</div>
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">{error}</div>
      )}
      <div className="flex flex-wrap gap-2">
        <select className="rounded-md border px-2 py-1" value={type} onChange={(e) => setType(e.target.value as any)}>
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
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <input
        placeholder="Note (optionnel)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <input
        placeholder="URL de pièce jointe (mock)"
        value={attachmentUrl}
        onChange={(e) => setAttachmentUrl(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <div className="pt-1">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Enregistrer le mouvement
        </button>
      </div>
    </form>
  );
}

