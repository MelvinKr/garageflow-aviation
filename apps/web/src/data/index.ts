import { getBackend } from "./backend";
import { partsRepo as mockParts, quotesRepo as mockQuotes, workOrdersRepo as mockWO, poRepo as mockPO } from "./mock";

export const Repos = (() => {
  if (getBackend() === "DB") {
    // lazy import server (évite edge/client)
    const db = require("./db");
    return {
      parts: db.partsRepoDb,
      quotes: db.quotesRepoDb,
      workorders: db.workOrdersRepoDb,
      po: db.poRepoDb,
    };
  }
  return { parts: mockParts, quotes: mockQuotes, workorders: mockWO, po: mockPO };
})();

