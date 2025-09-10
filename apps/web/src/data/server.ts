// Server-only Repos mapping to DB implementations
import { partsRepoDb, quotesRepoDb, workOrdersRepoDb, poRepoDb } from "./db.server";

export const Repos = {
  parts: partsRepoDb,
  quotes: quotesRepoDb,
  workorders: workOrdersRepoDb,
  po: poRepoDb,
} as const;

