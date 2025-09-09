import { pgTable, varchar, integer, numeric, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const parts = pgTable("parts", {
  id: varchar("id", { length: 32 }).primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }),
  supplierId: varchar("supplier_id", { length: 32 }),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).default("0"),
  qty: integer("qty").default(0),
  reservedQty: integer("reserved_qty").default(0),
  minQty: integer("min_qty").default(0),
  location: varchar("location", { length: 64 }),
  cert: varchar("cert", { length: 64 }),
  certUrl: varchar("cert_url", { length: 512 }),
  photoUrl: varchar("photo_url", { length: 512 }),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 256 }),
  phone: varchar("phone", { length: 64 }),
  address: varchar("address", { length: 512 }),
  currency: varchar("currency", { length: 8 }),
  leadTimeDays: integer("lead_time_days"),
});

export const customers = pgTable("customers", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  contact: varchar("contact", { length: 128 }),
  email: varchar("email", { length: 256 }),
  phone: varchar("phone", { length: 64 }),
  terms: varchar("terms", { length: 32 }),
  address: varchar("address", { length: 512 }),
});

export const aircraft = pgTable("aircraft", {
  id: varchar("id", { length: 32 }).primaryKey(),
  reg: varchar("reg", { length: 32 }).notNull(),
  type: varchar("type", { length: 64 }),
  hours: numeric("hours", { precision: 10, scale: 1 }),
  cycles: integer("cycles"),
  base: varchar("base", { length: 32 }),
  ownerId: varchar("owner_id", { length: 32 }),
  nextDue: jsonb("next_due"),
});

export const quotes = pgTable("quotes", {
  id: varchar("id", { length: 32 }).primaryKey(),
  customerId: varchar("customer_id", { length: 32 }).notNull(),
  aircraftId: varchar("aircraft_id", { length: 32 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  discountPct: numeric("discount_pct", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quoteItems = pgTable("quote_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  quoteId: varchar("quote_id", { length: 32 }).notNull(),
  kind: varchar("kind", { length: 8 }).notNull(),
  label: varchar("label", { length: 256 }).notNull(),
  partId: varchar("part_id", { length: 32 }),
  qty: numeric("qty", { precision: 10, scale: 2 }),
  unit: numeric("unit", { precision: 10, scale: 2 }),
  hours: numeric("hours", { precision: 10, scale: 2 }),
  rate: numeric("rate", { precision: 10, scale: 2 }),
});

export const workorders = pgTable("workorders", {
  id: varchar("id", { length: 32 }).primaryKey(),
  quoteId: varchar("quote_id", { length: 32 }),
  aircraftId: varchar("aircraft_id", { length: 32 }).notNull(),
  status: varchar("status", { length: 24 }).notNull(),
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
  notes: varchar("notes", { length: 1024 }),
});

export const woTasks = pgTable("wo_tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  woId: varchar("wo_id", { length: 32 }).notNull(),
  label: varchar("label", { length: 256 }).notNull(),
  partId: varchar("part_id", { length: 32 }),
  qty: numeric("qty", { precision: 10, scale: 2 }),
  done: boolean("done").default(false),
  hours: numeric("hours", { precision: 10, scale: 2 }),
  rate: numeric("rate", { precision: 10, scale: 2 }),
});

export const movements = pgTable("movements", {
  id: varchar("id", { length: 40 }).primaryKey(),
  partId: varchar("part_id", { length: 32 }).notNull(),
  type: varchar("type", { length: 12 }).notNull(),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull(),
  reason: varchar("reason", { length: 128 }),
  ref: varchar("ref", { length: 64 }),
  by: varchar("by", { length: 64 }),
  at: timestamp("at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id", { length: 32 }).primaryKey(),
  supplierId: varchar("supplier_id", { length: 32 }).notNull(),
  status: varchar("status", { length: 24 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expectedAt: timestamp("expected_at"),
});

export const poItems = pgTable("po_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  poId: varchar("po_id", { length: 32 }).notNull(),
  partId: varchar("part_id", { length: 32 }).notNull(),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }),
});

