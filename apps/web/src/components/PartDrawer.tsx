"use client";
import { useEffect } from "react";

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
};

export function PartDrawer({ part, onClose }: { part: Part | null; onClose: () => void }) {
  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const open = !!part;
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
          <div className="font-semibold">Détail pièce</div>
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
              <Field label="Seuil Min" value={String(part.minQty ?? "")} />
              <Field label="Coût unitaire (CAD)" value={part.unitCost?.toString()} />
              <Field label="Emplacement" value={part.location} />
              <Field label="Fournisseur" value={part.supplier} />
              <Field label="Dernière entrée" value={part.lastIn} />
            </div>

            <div className="pt-2">
              <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
                Mouvement stock
              </button>
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

