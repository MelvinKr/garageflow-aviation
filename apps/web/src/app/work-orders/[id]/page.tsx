import { getWorkOrder } from "@/data/workorders.repo";

export default async function WorkOrderDetails({ params }: { params: { id: string } }) {
  const wo = await getWorkOrder(params.id);
  if (!wo) return <div className="p-6 text-gray-500">WO introuvable</div>;
  return (
    <section className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">WO {wo.id}</h1>
      <div className="text-sm text-gray-600">Ouvert: {wo.created_at ? new Date(wo.created_at).toLocaleString() : ""}</div>
      <div className="text-sm text-gray-600">Fermé: {wo.closed_at ? new Date(wo.closed_at).toLocaleString() : ""}</div>
      <a className="underline text-sm" href="/work-orders">← Retour</a>
    </section>
  );
}

