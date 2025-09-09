"use client";
import { useEffect, useMemo, useState } from "react";
import { getSuppliers } from "@/lib/mock";
import { listMovementsFor, clearFor as clearMovementsFor } from "@/lib/movementStore";
import { getReservedFor, setReservedFor } from "@/lib/reservedStore";
import { StockMoveForm } from "@/components/StockMoveForm";

type Part = {
  id: string;
  sku?: string;
  name: string;
  category?: string;
  cert?: string;
  qty?: number;
  minQty?: number;
  unitCost?: number;
  location?: string;
  supplier?: string;
  lastIn?: string;
  batch?: string;
  serial?: string;
  expiry?: string;
  compat?: string[];
  reservedQty?: number;
};

export function PartDrawer({
  part,
  onClose,
  onMovement,
  onReservedChange,
  onMovementsReset,
}: {
  part: Part | null;
  onClose: () => void;
  onMovement?: (delta: number, reason: string, fileName?: string) => void;
  onReservedChange?: (key: string, qty: number) => void;
  onMovementsReset?: (key: string) => void;
}) {
  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const open = !!part;
  const history = useMovements(part);
  const supplier = useMemo(() => {
    if (!part?.supplier) return null;
    const list = getSuppliers() as any[];
    return list.find((s) => s.name?.toLowerCase() === part.supplier?.toLowerCase());
  }, [part]);
  const key = String(part?.sku || part?.id || "");
  const [reserved, setReserved] = useState<number>(0);
  useEffect(() => {
    if (!key) return;
    setReserved(getReservedFor(key));
  }, [key]);
  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="font-semibold inline-flex items-center gap-2">
            Détail pièce
            {part && part.qty !== undefined && part.minQty !== undefined && part.qty <= part.minQty && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">LOW</span>
            )}
          </div>
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={onClose}>
            Fermer
          </button>
        </div>
        {part && (
          <div className="space-y-4 p-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">SKU</div>
              <div className="font-medium">{part.sku ?? part.id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Nom</div>
              <div className="font-medium">{part.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Catégorie" value={part.category} />
              <Field label="Certificat" value={part.cert} />
              <Field label="Qté" value={String(part.qty ?? "")} />
              <div>
                <div className="text-xs text-gray-500">Réservé</div>
                <div>
                  <input
                    type="number"
                    min={0}
                    value={reserved}
                    onChange={(e) => setReserved(Math.max(0, Number(e.target.value) || 0))}
                    className="w-28 rounded-md border px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      setReservedFor(key, reserved);
                      onReservedChange?.(key, reserved);
                    }}
                    className="ml-2 rounded-md bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
              <Field label="Disponible" value={String((part.qty ?? 0) - reserved)} />
              <Field label="Seuil Min" value={String(part.minQty ?? "")} />
              <Field label="Coût unitaire (CAD)" value={part.unitCost?.toString()} />
              <Field label="Emplacement" value={part.location} />
              <Field label="Lot/Batch" value={part.batch} />
              <Field label="N° Série" value={part.serial} />
              <Field label="Péremption" value={part.expiry} />
              <Field label="Compatibilité" value={part.compat?.join(", ")} />
              <Field label="Fournisseur" value={part.supplier} />
              {supplier && (
                <div className="col-span-2 text-xs text-gray-600">
                  <div className="font-medium">{supplier.name}</div>
                  <div>{supplier.email} — {supplier.phone}</div>
                </div>
              )}
              <Field label="Dernière entrée" value={part.lastIn} />
            </div>

            <StockMoveForm
              partKey={String(part.sku || part.id)}
              currentQty={Number(part.qty ?? 0)}
              onSubmit={(payload) => {
                onMovement?.(payload.signedQty, payload.reason, payload.attachmentUrl);
                onClose();
              }}
            />

            <div className="pt-2">
              <div className="mb-2 text-sm font-medium">Historique mouvements</div>
              {history.length === 0 ? (
                <div className="text-xs text-gray-500">Aucun mouvement enregistré.</div>
              ) : (
                <ul className="max-h-56 overflow-auto divide-y rounded border">
                  {history.map((m, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                      <span className={m.delta >= 0 ? "text-green-700" : "text-red-700"}>
                        {m.delta >= 0 ? "+" : ""}
                        {m.delta}
                      </span>
                      <span className="flex-1 text-gray-700">{m.reason || "—"}</span>
                      <span className="text-gray-400">{new Date(m.at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-2 text-right">
                <button
                  onClick={() => {
                    // clear LS for this key
                    try {
                      const raw = localStorage.getItem("gf_movements");
                      const arr = raw ? JSON.parse(raw) : [];
                      const filtered = arr.filter((m: any) => (m.sku || m.id) !== key);
                      localStorage.setItem("gf_movements", JSON.stringify(filtered));
                    } catch {}
                    clearMovementsFor(key);
                    onMovementsReset?.(key);
                  }}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                >
                  Reset mouvements
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function useMovements(part: Part | null) {
  const [items, setItems] = useState<Array<{ delta: number; reason?: string; at: string }>>([]);
  useEffect(() => {
    if (!part) return;
    try {
      const raw = localStorage.getItem("gf_movements");
      if (!raw) return setItems([]);
      const arr: any[] = JSON.parse(raw);
      const key = part.sku || part.id;
      const lsItems = arr.filter((m) => (m.sku || m.id) === key);
      const memItems = listMovementsFor(key);
      const merged = [...lsItems, ...memItems]
        .sort((a, b) => (a.at > b.at ? -1 : 1))
        .slice(0, 50);
      setItems(merged);
    } catch {
      setItems([]);
    }
  }, [part]);
  return items;
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
