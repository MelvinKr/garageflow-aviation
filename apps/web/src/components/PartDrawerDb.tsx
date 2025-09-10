"use client";

import { useEffect, useState } from "react";
import { getPartAction, updatePartAction, createMovementAction } from "@/app/parts/actions";
import { useToast } from "@/components/ui/useToast";

export default function PartDrawer({ id, onClose }: { id: string; onClose: ()=>void }) {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [min, setMin] = useState(0);
  const [qty, setQty] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getPartAction(id);
        if (cancelled) return;
        setName(p.name || "");
        setMin(Number(p.min_stock ?? 0));
        setQty(Number(p.on_hand ?? 0));
      } catch (e: any) {
        push({ type: "error", message: e?.message || String(e) });
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function saveMeta() {
    try {
      await updatePartAction({ id, name, min_stock: min });
      push({ type: "success", message: "Sauvegardé" });
      onClose();
    } catch (e: any) {
      push({ type: "error", message: e?.message || String(e) });
    }
  }

  async function adjust(delta: number) {
    try {
      const type = delta >= 0 ? "IN" : "OUT";
      await createMovementAction({ part_id: id, type, quantity: Math.abs(delta), note: "Ajustement" });
      setQty(q => q + delta);
      push({ type: "success", message: "Mouvement enregistré" });
    } catch (e: any) {
      push({ type: "error", message: e?.message || String(e) });
    }
  }

  if (loading) return null;
  return (
    <div className="fixed right-0 top-0 h-full w-[420px] bg-white border-l shadow-xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Pièce {id}</h2>
        <button onClick={onClose} className="text-sm underline">Fermer</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm grid gap-1">
          <span className="text-gray-500">Nom</span>
          <input className="border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} />
        </label>
        <label className="text-sm grid gap-1">
          <span className="text-gray-500">Seuil min</span>
          <input type="number" className="border rounded px-2 py-1" value={min} onChange={e=>setMin(Number(e.target.value)||0)} />
        </label>
        <div className="col-span-2 text-sm">
          <div className="text-gray-500 mb-1">Quantité en stock</div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border rounded" onClick={()=>adjust(-1)}>-1</button>
            <button className="px-2 py-1 border rounded" onClick={()=>adjust(+1)}>+1</button>
            <span className="ml-2">Actuel: <b>{qty}</b></span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={saveMeta} className="px-3 py-1 rounded bg-black text-white hover:opacity-90">Sauvegarder</button>
        <button onClick={onClose} className="px-3 py-1 rounded border hover:bg-gray-50">Annuler</button>
      </div>
    </div>
  );
}

