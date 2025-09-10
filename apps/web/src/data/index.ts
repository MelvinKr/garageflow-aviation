import { getBackend } from "./backend";
import { partsRepo as mockParts, quotesRepo as mockQuotes, workOrdersRepo as mockWO, poRepo as mockPO } from "./mock";

export const Repos = (() => {
  const isServer = typeof window === "undefined";
  const backend = getBackend();
  if (isServer && backend === "DB") {
    // lazy import server-only implementation when on server
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = require("./db.server");
    return {
      parts: db.partsRepoDb,
      quotes: db.quotesRepoDb,
      workorders: db.workOrdersRepoDb,
      po: db.poRepoDb,
    } as const;
  }
  return { parts: mockParts, quotes: mockQuotes, workorders: mockWO, po: mockPO } as const;
})();
