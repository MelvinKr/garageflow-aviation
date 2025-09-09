import { getParts } from "@/lib/mock";
import { DataTable } from "@/components/DataTable";

export default function PartsPage() {
  const rows = getParts();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Inventaire — Pièces</h1>
      <DataTable
        rows={rows}
        cols={[
          { key: "id", label: "Ref" },
          { key: "name", label: "Nom" },
          { key: "category", label: "Catégorie" },
          { key: "cert", label: "Certif." },
          { key: "qty", label: "Qté" },
          { key: "minQty", label: "Min" },
          { key: "unitCost", label: "Coût Unitaire" },
          { key: "location", label: "Emplacement" }
        ]}
      />
    </main>
  );
}

