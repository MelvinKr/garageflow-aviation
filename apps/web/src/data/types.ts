export type Id = string;

export type PartBase = {
  id: Id; sku: string; name: string;
  category?: string | null;
  supplierId?: Id | null;
  unitCost?: number | null;
  qty?: number | null;
  reservedQty?: number | null;
  minQty?: number | null;
  location?: string | null;
  cert?: string | null;
  certUrl?: string | null;
  photoUrl?: string | null;
};

export type Supplier = {
  id: Id; name: string; email?: string | null; phone?: string | null;
  address?: string | null; currency?: string | null; leadTimeDays?: number | null;
};

export type Customer = {
  id: Id; name: string; contact?: string | null; email?: string | null;
  phone?: string | null; terms?: string | null; address?: string | null;
};

export type Aircraft = {
  id: Id; reg: string; type?: string | null; hours?: number | null;
  cycles?: number | null; base?: string | null; ownerId?: Id | null;
  nextDue?: any;
};

export type QuoteItem = {
  id: Id; kind: "part" | "labor"; label: string;
  partId?: Id; qty?: number; unit?: number; hours?: number; rate?: number;
};

export type Quote = {
  id: Id; customerId: Id; aircraftId: Id;
  status: "draft"|"sent"|"accepted"; discountPct?: number; createdAt: string;
  items: QuoteItem[];
};

export type WoTask = { id: Id; label: string; partId?: Id|null; qty?: number|null; done: boolean; hours?: number; rate?: number };
export type WorkOrder = { id: Id; quoteId?: Id|null; aircraftId: Id; status: "draft"|"in_progress"|"awaiting_signature"|"closed"|"pending"; openedAt: string; closedAt?: string|null; tasks: WoTask[] };

export type StockMove = { id: Id; partId: Id; type: "IN"|"OUT"|"RESERVE"|"UNRESERVE"; qty: number; reason?: string; ref?: string; by?: string; at: string };

export type POItem = { id: Id; partId: Id; qty: number; unitCost?: number|null };
export type PurchaseOrder = { id: Id; supplierId: Id; status: "draft"|"ordered"|"partially_received"|"received"|"cancelled"; createdAt: string; expectedAt?: string|null; items: POItem[] };

export type RepoResult<T> = Promise<T>;

export interface PartsRepo {
  list(): RepoResult<PartBase[]>;
  get(id: Id): RepoResult<PartBase | null>;
  update(id: Id, patch: Partial<PartBase>): RepoResult<void>;
  movement(m: Omit<StockMove,"id"|"at"> & { at?: string }): RepoResult<StockMove>;
}

export interface QuotesRepo {
  list(): RepoResult<Quote[]>;
  accept(quoteId: Id): RepoResult<{ woId: Id }>;
}

export interface WorkOrdersRepo {
  list(): RepoResult<WorkOrder[]>;
  get(id: Id): RepoResult<WorkOrder | null>;
  toggleTask(woId: Id, taskId: Id): RepoResult<void>;
  setStatus(woId: Id, status: WorkOrder["status"]): RepoResult<void>;
}

export interface PurchaseOrdersRepo {
  list(): RepoResult<PurchaseOrder[]>;
  create(input: Omit<PurchaseOrder,"id"|"createdAt"|"status"> & Partial<Pick<PurchaseOrder,"status">>): RepoResult<Id>;
  receiveItem(poId: Id, itemId: Id, qty: number): RepoResult<void>;
}

