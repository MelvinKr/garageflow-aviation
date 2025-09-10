// EMA simple + logique de réassort
export function computeEMA(series: number[], alpha = 0.35): number[] {
  const out: number[] = [];
  let prev: number | null = null;
  for (const x of series) {
    if (prev == null) prev = x;
    else prev = alpha * x + (1 - alpha) * prev;
    out.push(prev);
  }
  return out;
}

export function restockSuggestion({
  onHand,
  ema,
  minStock,
  k = 1.5,
}: {
  onHand: number;
  ema: number;
  minStock: number;
  k?: number;
}) {
  const target = Math.max(minStock, Math.ceil(k * ema));
  if (onHand < target) {
    const reorderQty = Math.max(0, target - onHand);
    return { target, reorderQty };
  }
  return null;
}

