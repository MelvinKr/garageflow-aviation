export type QuoteItem = {
  id: string;
  kind: "part" | "labor";
  label: string;
  partId?: string;
  qty?: number;      // for parts
  unit?: number;     // for parts (unit price)
  hours?: number;    // for labor
  rate?: number;     // for labor
};

export function computeTotals(items: QuoteItem[], discountPct = 0, taxPct = 14.975) {
  let parts = 0, labor = 0;
  for (const it of items) {
    if (it.kind === "part") {
      parts += (it.unit ?? 0) * (it.qty ?? 0);
    } else {
      labor += (it.hours ?? 0) * (it.rate ?? 95);
    }
  }
  const subtotal = parts + labor;
  const discount = Math.round((subtotal * (discountPct/100)) * 100)/100;
  const taxable = subtotal - discount;
  const taxes = Math.round((taxable * (taxPct/100)) * 100)/100;
  const total = Math.round((taxable + taxes) * 100)/100;
  return { parts, labor, discount, taxes, total };
}

