import { listQuotesAction, createQuoteAction, updateQuoteAction } from "./actions";

export default async function QuotesPage() {
  const rows = await listQuotesAction({ limit: 200 });

  async function create() {
    "use server";
    await createQuoteAction({});
  }
  async function markSent(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await updateQuoteAction({ id, status: "sent" });
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Devis</h1>
        <form action={create}><button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Nouveau devis</button></form>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Devis #</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Aucun devis</td></tr>
            ) : rows.map((q) => (
              <tr key={q.id} className="border-t">
                <td className="px-3 py-2">{q.id}</td>
                <td className="px-3 py-2">{q.status}</td>
                <td className="px-3 py-2">{Number(q.total_amount ?? 0).toFixed(2)}</td>
                <td className="px-3 py-2">
                  <form action={markSent} className="inline">
                    <input type="hidden" name="id" value={q.id} />
                    <button className="px-2 py-1 border rounded text-xs">Marquer “envoyé”</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

