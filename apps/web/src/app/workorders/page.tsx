import { getWorkOrders } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function WorkOrdersPage() {
  const rows = getWorkOrders().map((w: any) => ({
    ...w,
    tasksCount: w.tasks.length,
    done: w.tasks.filter((t: any) => t.done).length,
  }));
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Réparations en cours</h1>
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable
          rows={rows}
          cols={[
            { key: "id", label: "WO #" },
            { key: "aircraftId", label: "Avion" },
            { key: "openedAt", label: "Ouvert le" },
            { key: "status", label: "Statut" },
            { key: "tasksCount", label: "Tâches" },
            { key: "done", label: "Terminées" },
          ]}
        />
      </div>
    </main>
  );
}
