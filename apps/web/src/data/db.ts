import { getDb } from "@/db/client";
import * as sch from "@/db/schema";
import { PartsRepo, QuotesRepo, WorkOrdersRepo, PurchaseOrdersRepo, PartBase, StockMove } from "./types";
import { eq } from "drizzle-orm";

const toPart = (r: any): PartBase => ({ ...r });

export const partsRepoDb: PartsRepo = {
  async list() {
    const db = getDb();
    const rows = await db.select().from(sch.parts);
    return rows.map(toPart);
  },
  async get(id) {
    const db = getDb();
    const [row] = await db.select().from(sch.parts).where(eq(sch.parts.id, id));
    return row ? toPart(row) : null;
  },
  async update(id, patch) {
    const db = getDb();
    await db.update(sch.parts).set(patch as any).where(eq(sch.parts.id, id));
  },
  async movement(m) {
    const db = getDb();
    if (m.type === "IN") await db.execute(`update parts set qty = coalesce(qty,0) + $1 where id=$2`, [m.qty, m.partId]);
    if (m.type === "OUT") await db.execute(`update parts set qty = greatest(coalesce(qty,0) - $1, 0) where id=$2`, [m.qty, m.partId]);
    if (m.type === "RESERVE") await db.execute(`update parts set reserved_qty = coalesce(reserved_qty,0) + $1 where id=$2`, [m.qty, m.partId]);
    if (m.type === "UNRESERVE") await db.execute(`update parts set reserved_qty = greatest(coalesce(reserved_qty,0) - $1, 0) where id=$2`, [m.qty, m.partId]);
    const id = `M-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const at = m.at ?? new Date().toISOString();
    await db.insert(sch.movements).values({ id, at: new Date(at), ...m } as any);
    return { id, at, ...(m as any) } as StockMove;
  },
};

export const quotesRepoDb: QuotesRepo = {
  async list() {
    const db = getDb();
    const rows = await db.select().from(sch.quotes);
    return rows.map((r: any) => ({ ...r, createdAt: r.createdAt?.toISOString?.() ?? r.createdAt, items: [] }));
  },
  async accept(quoteId) {
    const db = getDb();
    await db.update(sch.quotes).set({ status: "accepted" }).where(eq(sch.quotes.id, quoteId));
    const woId = `WO-${Date.now()}`;
    await db.insert(sch.workorders).values({ id: woId, quoteId, aircraftId: "AC-UNKNOWN", status: "in_progress" } as any);
    return { woId };
  },
};

export const workOrdersRepoDb: WorkOrdersRepo = {
  async list() {
    const db = getDb();
    const rows = await db.select().from(sch.workorders);
    return rows.map((w: any) => ({ ...w, openedAt: w.openedAt?.toISOString?.() ?? w.openedAt, tasks: [] }));
  },
  async get(id) {
    const db = getDb();
    const [wo] = await db.select().from(sch.workorders).where(eq(sch.workorders.id, id));
    if (!wo) return null;
    const tasks = await db.select().from(sch.woTasks).where(eq(sch.woTasks.woId, id));
    return { ...wo, openedAt: wo.openedAt?.toISOString?.() ?? wo.openedAt, closedAt: wo.closedAt?.toISOString?.() ?? wo.closedAt, tasks } as any;
  },
  async toggleTask(woId, taskId) {
    const db = getDb();
    const [t] = await db.select().from(sch.woTasks).where(eq(sch.woTasks.id, taskId));
    if (!t) return;
    await db.update(sch.woTasks).set({ done: !t.done }).where(eq(sch.woTasks.id, taskId));
  },
  async setStatus(woId, s) {
    const db = getDb();
    await db.update(sch.workorders).set({ status: s }).where(eq(sch.workorders.id, woId));
  },
};

export const poRepoDb: PurchaseOrdersRepo = {
  async list() {
    const db = getDb();
    const rows = await db.select().from(sch.purchaseOrders);
    return rows.map((r:any)=>({ ...r, createdAt: r.createdAt?.toISOString?.() ?? r.createdAt, items: [] }));
  },
  async create(input) {
    const db = getDb();
    const id = `PO-${Date.now()}`;
    await db.insert(sch.purchaseOrders).values({ id, supplierId: input.supplierId, status: input.status ?? "ordered", expectedAt: input.expectedAt ? new Date(input.expectedAt) : null } as any);
    for (const it of input.items ?? []) {
      await db.insert(sch.poItems).values({ id: `POI-${Date.now()}-${Math.random()}`, poId: id, partId: it.partId, qty: it.qty, unitCost: it.unitCost ?? null } as any);
    }
    return id;
  },
  async receiveItem(poId, itemId, qty) {
    const db = getDb();
    const [it] = await db.select().from(sch.poItems).where(eq(sch.poItems.id, itemId));
    if (!it) return;
    await partsRepoDb.movement({ partId: it.partId, type: "IN", qty, reason: "Réception PO", ref: poId });
    await partsRepoDb.movement({ partId: it.partId, type: "UNRESERVE", qty: Math.max(0, qty), reason: "Stock reçu", ref: poId });
    await db.update(sch.purchaseOrders).set({ status: "partially_received" }).where(eq(sch.purchaseOrders.id, poId));
  },
};
