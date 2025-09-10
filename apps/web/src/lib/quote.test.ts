import { describe, it, expect } from "vitest";
import { computeTotals } from "./quote";

describe("computeTotals", () => {
  it("calcule parts + labor + remise + taxes", () => {
    const items = [
      { id: "1", kind: "part" as const, label: "P", qty: 2, unit: 100 },
      { id: "2", kind: "labor" as const, label: "L", hours: 1, rate: 95 },
    ];
    const r = computeTotals(items, 10, 15);
    expect(r.parts).toBe(200);
    expect(r.labor).toBe(95);
    expect(r.total).toBeGreaterThan(0);
  });
});

