"use client";
import { getBackend } from "./backend";
import { PartsRepo, QuotesRepo, WorkOrdersRepo, PurchaseOrdersRepo, PartBase, StockMove } from "./types";
import { useMockState } from "@/store/mockState";

function requireMock() {
  if (getBackend() !== "MOCK") throw new Error("Mock repo utilisé alors que BACKEND=DB");
}

export const partsRepo: PartsRepo = {
  async list() { requireMock(); return useMockState.getState().parts as PartBase[]; },
  async get(id) { requireMock(); return (useMockState.getState().parts as PartBase[]).find(p=>p.id===id) ?? null; },
  async update(id, patch) { requireMock(); useMockState.getState().updatePart(id, patch as any); },
  async movement(m) {
    requireMock();
    const at = m.at ?? new Date().toISOString();
    const id = "M-" + Math.random().toString(36).slice(2);
    const move: StockMove = { id, at, ...(m as any) };
    useMockState.getState().addMovement(m as any);
    return move;
  }
};

export const quotesRepo: QuotesRepo = {
  async list() { requireMock(); return useMockState.getState().quotes; },
  async accept(quoteId) { requireMock(); return useMockState.getState().acceptQuote(quoteId); }
};

export const workOrdersRepo: WorkOrdersRepo = {
  async list() { requireMock(); return useMockState.getState().workorders; },
  async get(id) { requireMock(); return useMockState.getState().workorders.find(w=>w.id===id) ?? null; },
  async toggleTask(woId, taskId) { requireMock(); useMockState.getState().toggleTaskDone(woId, taskId); },
  async setStatus(woId, s) { requireMock(); useMockState.getState().setWoStatus(woId, s); }
};

export const poRepo: PurchaseOrdersRepo = {
  async list() { requireMock(); return useMockState.getState().purchaseOrders ?? []; },
  async create(input) { requireMock(); return useMockState.getState().createPO(input as any); },
  async receiveItem(poId, itemId, qty) { requireMock(); useMockState.getState().receivePoItem(poId, itemId, qty); }
};

