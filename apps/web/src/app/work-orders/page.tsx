import { listWorkOrdersAction, createWorkOrderAction, closeWorkOrderAction } from "./actions";

export default async function WorkOrdersPage() {
  const rows = await listWorkOrdersAction({ limit: 100 });

  async function create() {
    "use server";
    await createWorkOrderAction();
  }
  async function close(formData: FormData) {
    "use server";
    await closeWorkOrderAction({ id: String(formData.get("id")) });
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ordres de travail</h1>
        <form action={create}><button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Nouveau WO</button></form>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">WO #</th>
              <th className="px-3 py-2 text-left">Ouvert</th>
              <th className="px-3 py-2 text-left">Fermé</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Aucun WO</td></tr>
            ) : rows.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-3 py-2"><a className="underline" href={`/work-orders/${w.id}`}>{w.id}</a></td>
                <td className="px-3 py-2">{w.created_at ? new Date(w.created_at).toLocaleString() : ""}</td>
                <td className="px-3 py-2">{w.closed_at ? new Date(w.closed_at).toLocaleString() : ""}</td>
                <td className="px-3 py-2">
                  {!w.closed_at && (
                    <form action={close} className="inline">
                      <input type="hidden" name="id" value={w.id} />
                      <button className="px-2 py-1 border rounded text-xs">Clôturer</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

