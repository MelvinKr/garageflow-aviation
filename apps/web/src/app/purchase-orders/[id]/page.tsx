import { getPOAction, updatePOAction, addPoItemAction, receivePoItemAction } from "../actions";

export default async function POPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const po = await getPOAction(p.id);
  if (!po) return <div className="p-6 text-gray-500">PO introuvable</div>;

  async function updateSupplier(formData: FormData) {
    "use server";
    await updatePOAction({ id: p.id, supplier_id: String(formData.get("supplier_id") || "") });
  }
  async function addItem(formData: FormData) {
    "use server";
    await addPoItemAction({ po_id: p.id, part_id: String(formData.get("part_id")||""), qty: Number(formData.get("qty")||1), unit_cost: Number(formData.get("unit_cost")||0) });
  }
  async function receiveItem(formData: FormData) {
    "use server";
    await receivePoItemAction({ po_id: p.id, item_id: String(formData.get("item_id")||""), qty: Number(formData.get("qty")||1) });
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">PO {po.id}</h1>
        <a href="/purchase-orders" className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Retour</a>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xl text-sm">
        <form action={updateSupplier} className="grid gap-1">
          <span className="text-gray-500">Fournisseur (id/nom)</span>
          <div className="flex gap-2">
            <input name="supplier_id" defaultValue={po.supplier_id ?? ""} className="border rounded px-2 py-1 flex-1" />
            <button className="px-3 py-1 border rounded">Mettre à jour</button>
          </div>
        </form>
        <div className="grid gap-1">
          <span className="text-gray-500">Statut</span>
          <div className="px-2 py-1 border rounded inline-block bg-gray-50">{po.status}</div>
        </div>
      </div>

      <div className="border rounded overflow-hidden bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Ligne #</th>
              <th className="px-3 py-2 text-left">Part</th>
              <th className="px-3 py-2 text-left">Qté</th>
              <th className="px-3 py-2 text-left">Reçue</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(po.items ?? []).length === 0 ? (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={5}>Aucune ligne</td></tr>
            ) : (po.items as any[]).map((it) => (
              <tr key={it.id} className="border-t">
                <td className="px-3 py-2">{it.id}</td>
                <td className="px-3 py-2">{it.part_id}</td>
                <td className="px-3 py-2">{it.qty}</td>
                <td className="px-3 py-2">{it.received_qty ?? 0}</td>
                <td className="px-3 py-2">
                  <form action={receiveItem} className="flex items-center gap-2">
                    <input type="hidden" name="item_id" value={it.id} />
                    <input name="qty" type="number" min={1} defaultValue={1} className="border rounded px-2 py-1 w-24" />
                    <button className="px-2 py-1 border rounded text-xs">Recevoir</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={addItem} className="flex items-end gap-2 text-sm">
        <label className="grid gap-1">
          <span className="text-gray-500">Part id</span>
          <input name="part_id" className="border rounded px-2 py-1" placeholder="PART-001" />
        </label>
        <label className="grid gap-1">
          <span className="text-gray-500">Qté</span>
          <input name="qty" type="number" min={1} defaultValue={1} className="border rounded px-2 py-1 w-28" />
        </label>
        <label className="grid gap-1">
          <span className="text-gray-500">PU</span>
          <input name="unit_cost" type="number" step="0.01" defaultValue={0} className="border rounded px-2 py-1 w-32" />
        </label>
        <button className="px-3 py-1 border rounded">Ajouter ligne</button>
      </form>
    </section>
  );
}
