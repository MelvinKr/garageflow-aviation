import { pgTable, serial, text, integer, timestamp, varchar, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const movementTypeEnum = pgEnum("movement_type", ["CONSUME", "RECEIVE", "ADJUST"]);
export const quoteStatusEnum = pgEnum("quote_status", ["DRAFT", "SENT", "ACCEPTED", "REJECTED"]);

// PARTS
export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  partNumber: varchar("part_number", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  onHand: integer("on_hand").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// MOVEMENTS
export const movements = pgTable("movements", {
  id: serial("id").primaryKey(),
  partId: integer("part_id").notNull().references(() => parts.id, { onDelete: "cascade" }),
  type: movementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// QUOTES
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  status: quoteStatusEnum("status").notNull().default("DRAFT"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// WORK ORDERS
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

// Relations (optionnel)
export const partsRelations = relations(parts, ({ many }) => ({
  movements: many(movements),
}));

