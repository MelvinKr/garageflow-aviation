import { partsRepo as mockParts, quotesRepo as mockQuotes, workOrdersRepo as mockWO, poRepo as mockPO } from "./mock";

// Client-safe default repos (MOCK). Server code should import from "./server" for DB access.
export const Repos = { parts: mockParts, quotes: mockQuotes, workorders: mockWO, po: mockPO } as const;
