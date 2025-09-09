"use client";

import { create } from "zustand";
import partsData from "@/mock/parts.json";
import quotesData from "@/mock/quotes.json";
import workordersData from "@/mock/workorders.json";
import { ensureCanAcceptQuote } from "@/lib/guards";

// -------------------- Types --------------------
export type Part = typeof partsData[number];

export type StockMoveType = "IN" | "OUT" | "RESERVE" | "UNRESERVE";
export type StockMove = {
  id: string;
  partId: string;
  type: StockMoveType;
  qty: number;
  reason?: string;
  note?: string;
  by?: string;
  at: string;
  ref?: string; // e.g., WO-123 / Q-2025-001
};

export type QuoteItem = {
  id: string;
  kind: "part" | "labor";
  label: string;
  partId?: string;
  qty?: number;   // parts
  unit?: number;  // parts
  hours?: number; // labor
  rate?: number;  // labor
};

export type Quote = {
  id: string;
  customerId: string;
  aircraftId: string;
  status: "draft" | "sent" | "accepted";
  discountPct?: number;
  items: QuoteItem[];
  createdAt: string;
};

export type WoAttachment = {
  id: string;
  url: string;
  kind: "photo" | "doc";
  label?: string;
  at: string;
};

export type WoTask = {
  id: string;
  label: string;
  partId?: string | null;
  qty?: number | null;
  done: boolean;

  // NEW: labor tracking
  hours?: number;   // cumulé
  rate?: number;    // €/h
  running?: boolean; // timer en cours ?
  startedAt?: string | null;
};

export type WorkOrder = {
  id: string;
  quoteId?: string | null;
  aircraftId: string;
  status: "draft" | "in_progress" | "awaiting_signature" | "closed" | "pending";
  openedAt: string;
  closedAt?: string | null;
  tasks: WoTask[];

  // NEW:
  attachments?: WoAttachment[];
  notes?: string;
};

// -------------------- Helpers --------------------
function genId(prefix = "M"): string {
  const d = new Date();
  const iso = d.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${iso}-${rnd}`;
}
function nowISO() { return new Date().toISOString(); }

// -------------------- State --------------------
type State = {
  parts: Part[];
  quotes: Quote[];
  workorders: WorkOrder[];
  movements: StockMove[];
  purchaseOrders: PurchaseOrder[];

  // primitives inventaire
  updatePart: (id: string, patch: Partial<Part>) => void;
  addMovement: (m: Omit<StockMove, "id" | "at"> & { at?: string }) => void;

  // quotes
  addQuote: (q: Omit<Quote, "id" | "createdAt" | "status"> & Partial<Pick<Quote, "status">>) => string;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  removeQuote: (id: string) => void;

  // coeur Phase 3
  acceptQuote: (id: string) => { woId: string };
  toggleTaskDone: (woId: string, taskId: string) => void;
  setWoStatus: (woId: string, status: WorkOrder["status"]) => void;

  // util
  computeMissingForTask: (task: WoTask) => { missing: number; available: number; min: number };

  // labor
  toggleTaskTimer: (woId: string, taskId: string) => void;
  addTaskHours: (woId: string, taskId: string, hours: number) => void;
  setTaskRate: (woId: string, taskId: string, rate: number) => void;

  // attachments
  addAttachment: (woId: string, file: { url: string; kind: "photo"|"doc"; label?: string }) => void;
  removeAttachment: (woId: string, attId: string) => void;

  // purchase orders
  createPO: (p: Omit<PurchaseOrder, "id" | "createdAt" | "status"> & Partial<Pick<PurchaseOrder, "status">>) => string;
  addPoItem: (poId: string, item: Omit<PoItem, "id">) => void;
  updatePO: (poId: string, patch: Partial<PurchaseOrder>) => void;
  receivePoItem: (poId: string, itemId: string, qtyToReceive: number) => void;
};

// --- PO Types ---
export type PoItem = { id: string; partId: string; qty: number; unitCost?: number };
export type PurchaseOrder = {
  id: string;
  supplierId: string;
  status: "draft" | "ordered" | "partially_received" | "received" | "cancelled";
  createdAt: string;
  expectedAt?: string | null;
  items: PoItem[];
  refQuoteId?: string | null;
  refWoId?: string | null;
};

export const useMockState = create<State>((set, get) => ({
  parts: partsData as Part[],
  quotes: (quotesData as Quote[]) ?? [],
  workorders: (workordersData as WorkOrder[]) ?? [],
  movements: [],
  purchaseOrders: [],

  updatePart: (id, patch) =>
    set((s) => ({
      parts: s.parts.map((p) => (p.id === id ? ({ ...p, ...patch } as Part) : p)),
    })),

  addMovement: (m) =>
    set((s) => {
      const id = genId("M");
      const at = m.at ?? nowISO();
      const move: StockMove = { id, at, ...m };
      const parts = s.parts.map((p) => {
        if (p.id !== m.partId) return p;
        const qty = Number(p.qty ?? 0);
        const reserved = Number(p.reservedQty ?? 0);
        if (m.type === "IN") return { ...p, qty: qty + m.qty };
        if (m.type === "OUT") return { ...p, qty: Math.max(0, qty - m.qty) };
        if (m.type === "RESERVE") return { ...p, reservedQty: reserved + m.qty };
        if (m.type === "UNRESERVE") return { ...p, reservedQty: Math.max(0, reserved - m.qty) };
        return p;
      });
      return { parts, movements: [move, ...s.movements] };
    }),

  // ------------- Quotes CRUD -------------
  addQuote: (q) => {
    const id = genId("Q");
    const createdAt = nowISO();
    const status: Quote["status"] = q.status ?? "draft";
    set((s) => ({ quotes: [{ id, createdAt, status, ...q } as Quote, ...s.quotes] }));
    return id;
  },
  updateQuote: (id, patch) => set((s) => ({ quotes: s.quotes.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeQuote: (id) => set((s) => ({ quotes: s.quotes.filter((x) => x.id !== id) })),

  // ------------- Coeur Phase 3 -------------
  acceptQuote: (quoteId) => {
    const s = get();
    const q = s.quotes.find((x) => x.id === quoteId);
    if (!q) throw new Error("Devis introuvable");
    ensureCanAcceptQuote(q.items.length);
    if (q.items.length === 0) throw new Error("Devis vide — impossible d'accepter.");

    const tasks: WoTask[] = q.items
      .filter((it) => it.kind === "part" && it.partId && (it.qty ?? 0) > 0)
      .map((it) => ({ id: genId("WOT"), label: it.label, partId: it.partId!, qty: it.qty ?? 0, done: false }));

    const woId = genId("WO");
    const wo: WorkOrder = {
      id: woId,
      quoteId: q.id,
      aircraftId: q.aircraftId,
      status: "in_progress",
      openedAt: nowISO(),
      closedAt: null,
      tasks,
    };

    const parts = s.parts.map((p) => {
      const qty = Number(p.qty ?? 0);
      const reserved = Number(p.reservedQty ?? 0);
      const needed = tasks.filter((t) => t.partId === p.id).reduce((acc, t) => acc + Number(t.qty ?? 0), 0);
      if (!needed) return p;
      return { ...p, reservedQty: reserved + needed };
    });

    set((state) => {
      const newMoves: StockMove[] = tasks.map((t) => ({
        id: genId("M"),
        at: nowISO(),
        partId: t.partId!,
        type: "RESERVE",
        qty: Number(t.qty ?? 0),
        reason: "Réservation devis accepté",
        ref: q.id,
        by: "system",
      }));
      return {
        quotes: state.quotes.map((x) => (x.id === q.id ? { ...x, status: "accepted" } : x)),
        workorders: [wo, ...state.workorders],
        parts,
        movements: [...newMoves, ...state.movements],
      };
    });

    return { woId };
  },

  toggleTaskDone: (woId, taskId) =>
    set((s) => {
      const wo = s.workorders.find((x) => x.id === woId);
      if (!wo) return {};
      const tasks = wo.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const newDone = !t.done;
        if (newDone && t.partId && (t.qty ?? 0) > 0) {
          const part = s.parts.find((p) => p.id === t.partId);
          if (part) {
            const consume = Math.max(0, Math.min(Number(t.qty ?? 0), Number(part.qty ?? 0)));
            const unreserve = Math.max(0, Math.min(Number(t.qty ?? 0), Number(part.reservedQty ?? 0)));
            part.qty = Math.max(0, Number(part.qty ?? 0) - consume);
            part.reservedQty = Math.max(0, Number(part.reservedQty ?? 0) - unreserve);
            s.movements.unshift({ id: genId("M"), at: nowISO(), partId: part.id, type: "OUT", qty: consume, reason: "Consommation tâche WO", ref: wo.id, by: "system" });
            if (unreserve > 0) s.movements.unshift({ id: genId("M"), at: nowISO(), partId: part.id, type: "UNRESERVE", qty: unreserve, reason: "Dé-réservation tâche terminée", ref: wo.id, by: "system" });
          }
        }
        return { ...t, done: newDone };
      });
      const workorders = s.workorders.map((x) => (x.id === woId ? { ...x, tasks } : x));
      return { workorders, parts: [...s.parts], movements: [...s.movements] };
    }),

  setWoStatus: (woId, status) => set((s) => ({ workorders: s.workorders.map((w) => (w.id === woId ? { ...w, status, closedAt: status === "closed" ? nowISO() : w.closedAt } : w)) })),

  computeMissingForTask: (task) => {
    if (!task.partId || !task.qty) return { missing: 0, available: 0, min: 0 };
    const p = get().parts.find((x) => x.id === task.partId);
    if (!p) return { missing: 0, available: 0, min: 0 };
    const avail = Math.max(0, Number(p.qty ?? 0) - Number(p.reservedQty ?? 0));
    const missing = Math.max(0, Number(task.qty) - avail);
    return { missing, available: avail, min: Number(p.minQty ?? 0) };
  },

  // ------------- Purchase Orders -------------
  createPO: (po) => {
    const id = genId("PO");
    const createdAt = nowISO();
    const status: PurchaseOrder["status"] = po.status ?? "ordered";
    set((s) => ({ purchaseOrders: [{ id, createdAt, status, ...po, items: po.items ?? [] } as PurchaseOrder, ...s.purchaseOrders] }));
    return id;
  },
  addPoItem: (poId, item) =>
    set((s) => ({
      purchaseOrders: s.purchaseOrders.map((po) => (po.id === poId ? { ...po, items: [{ id: genId("POI"), ...item }, ...po.items] } : po)),
    })),
  updatePO: (poId, patch) =>
    set((s) => ({ purchaseOrders: s.purchaseOrders.map((po) => (po.id === poId ? { ...po, ...patch } : po)) })),
  receivePoItem: (poId, itemId, qtyToReceive) =>
    set((s) => {
      const po = s.purchaseOrders.find((p) => p.id === poId);
      if (!po) return {};
      const it = po.items.find((i) => i.id === itemId);
      if (!it) return {};
      const qty = Math.max(0, qtyToReceive);
      const part = s.parts.find((p) => p.id === it.partId);
      if (part && qty > 0) {
        part.qty = Number(part.qty ?? 0) + qty;
        s.movements.unshift({ id: genId("M"), at: nowISO(), type: "IN", qty, partId: part.id, reason: "Réception PO", ref: po.id, by: "system" });
        const unres = Math.min(qty, Number(part.reservedQty ?? 0));
        if (unres > 0) {
          part.reservedQty = Math.max(0, Number(part.reservedQty ?? 0) - unres);
          s.movements.unshift({ id: genId("M"), at: nowISO(), type: "UNRESERVE", qty: unres, partId: part.id, reason: "Stock reçu", ref: po.id, by: "system" });
        }
      }
      let status: PurchaseOrder["status"] = po.status;
      status = "partially_received";
      return { purchaseOrders: s.purchaseOrders.map((p) => (p.id === poId ? { ...po, status } : p)), parts: [...s.parts], movements: [...s.movements] };
    }),

  // ------------- Labor tracking -------------
  toggleTaskTimer: (woId, taskId) =>
    set((s) => {
      const wo = s.workorders.find((w) => w.id === woId);
      if (!wo) return {};
      const now = Date.now();
      wo.tasks = wo.tasks.map((t) => {
        if (t.id !== taskId) return t;
        if (t.running) {
          const start = t.startedAt ? new Date(t.startedAt).getTime() : now;
          const delta = Math.max(0, (now - start) / 3600000);
          return { ...t, running: false, startedAt: null, hours: (t.hours ?? 0) + delta };
        } else {
          return { ...t, running: true, startedAt: new Date().toISOString() };
        }
      });
      return { workorders: [...s.workorders] };
    }),

  addTaskHours: (woId, taskId, hours) =>
    set((s) => {
      const wo = s.workorders.find((w) => w.id === woId);
      if (!wo) return {};
      wo.tasks = wo.tasks.map((t) => (t.id === taskId ? { ...t, hours: Math.max(0, (t.hours ?? 0) + hours) } : t));
      return { workorders: [...s.workorders] };
    }),

  setTaskRate: (woId, taskId, rate) =>
    set((s) => {
      const wo = s.workorders.find((w) => w.id === woId);
      if (!wo) return {};
      wo.tasks = wo.tasks.map((t) => (t.id === taskId ? { ...t, rate } : t));
      return { workorders: [...s.workorders] };
    }),

  // ------------- Attachments -------------
  addAttachment: (woId, file) =>
    set((s) => {
      const wo = s.workorders.find((w) => w.id === woId);
      if (!wo) return {};
      const att: WoAttachment = { id: genId("ATT"), at: nowISO(), ...file } as WoAttachment;
      wo.attachments = [att, ...(wo.attachments ?? [])];
      return { workorders: [...s.workorders] };
    }),

  removeAttachment: (woId, attId) =>
    set((s) => {
      const wo = s.workorders.find((w) => w.id === woId);
      if (!wo) return {};
      wo.attachments = (wo.attachments ?? []).filter((a) => a.id !== attId);
      return { workorders: [...s.workorders] };
    }),
}));

// Mock upload image -> DataURL base64
export async function mockUpload(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(buf).toString("base64")
      : btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `data:${file.type};base64,${base64}`;
}
