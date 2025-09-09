import { getParts, getSuppliers } from "@/lib/mock";
import { PartsTable } from "@/components/PartsTable";
import Link from "next/link";

type Row = ReturnType<typeof getParts>[number] & { sku?: string };

function toNum(x: any, d = 0) {
  const n = typeof x === "string" ? parseFloat(x) : x;
  return Number.isFinite(n) ? Number(n) : d;
}

function qtyDispo(p: any) {
  return toNum(p.qty) - toNum(p.reservedQty);
}

function isLow(p: any) {
  const dispo = qtyDispo(p);
  const min = toNum(p.minQty);
  return dispo <= min;
}

export default function PartsPage({
  searchParams,
}: {
  searchParams?: { lowStock?: string; q?: string; cat?: string };
}) {
  const parts = getParts() as Row[];
  const suppliers = getSuppliers() as any[];
  const supById = new Map(suppliers.map((s: any) => [s.id, s]));

  const q = (searchParams?.q ?? "").toLowerCase().trim();
  const cat = (searchParams?.cat ?? "").toLowerCase().trim();

  let rows = parts.filter((p: any) => {
    const okQ = !q || `${p.sku ?? ""} ${p.name ?? ""} ${p.category ?? ""} ${p.cert ?? ""}`.toLowerCase().includes(q);
    const okCat = !cat || String(p.category ?? "").toLowerCase() === cat;
    return okQ && okCat;
  });

  const onlyLow = searchParams?.lowStock === "1";
  if (onlyLow) rows = rows.filter(isLow);

  function buildPOmailto(p: any) {
    const sup = supById.get(p.supplierId);
    const email = sup?.email ?? "orders@example.com";
    const subject = encodeURIComponent(`Commande ${p.sku ?? p.id} – ${p.name ?? "Pièce"}`);
    const dispo = qtyDispo(p);
    const min = toNum(p.minQty);
    const qtyToOrder = Math.max(min * 2 - dispo, min - dispo + 1, 1);
    const body = encodeURIComponent(
      `Bonjour,\n\nMerci de nous confirmer la dispo et le délai sur l’article:\n- SKU: ${p.sku}\n- Nom: ${p.name}\n- Certification: ${p.cert ?? "-"}\n- Quantité souhaitée: ${qtyToOrder}\n\nAdresse de livraison: [votre adresse]\nConditions: [NET30 / DUE_ON_RECEIPT]\nRéf. interne: ${p.id}\n\nCordialement,\nGarageFlow Aviation`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inventaire — Pièces {onlyLow && "(Sous le seuil)"}</h1>
        <div className="flex gap-2 text-sm">
          <Link href="/parts" className="underline">
            Toutes
          </Link>
          <Link href={{ pathname: "/parts", query: { lowStock: "1" } }} className="underline">
            Sous le seuil
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <PartsTable
          rows={rows.map((p: any) => ({
            ...p,
            dispo: qtyDispo(p),
            min: toNum(p.minQty),
            supplierName: supById.get(p.supplierId)?.name ?? p.supplier ?? "-",
            poHref: buildPOmailto(p),
          }))}
        />
      </div>
    </section>
  );
}
