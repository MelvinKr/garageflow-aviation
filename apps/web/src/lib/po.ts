export function suggestPoLines(parts: any[]) {
  return parts
    .filter((p) => (Number(p.qty ?? 0) - Number(p.reservedQty ?? 0)) <= Number(p.minQty ?? 0))
    .map((p) => ({
      partId: p.id,
      qty: Math.max(1, Math.ceil(Number(p.minQty ?? 1) * 1.2)),
      supplierId: p.supplierId ?? "SUP-001",
    }));
}

