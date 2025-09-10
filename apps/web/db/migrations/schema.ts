import { pgTable, serial, numeric, timestamp, unique, varchar, text, integer, foreignKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const movementType = pgEnum("movement_type", ['CONSUME', 'RECEIVE', 'ADJUST'])
export const quoteStatus = pgEnum("quote_status", ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'])


export const quotes = pgTable("quotes", {
	id: serial().primaryKey().notNull(),
	status: quoteStatus().default('DRAFT').notNull(),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const workOrders = pgTable("work_orders", {
	id: serial().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	closedAt: timestamp("closed_at", { withTimezone: true, mode: 'string' }),
});

export const parts = pgTable("parts", {
	id: serial().primaryKey().notNull(),
	partNumber: varchar("part_number", { length: 64 }).notNull(),
	name: text().notNull(),
	onHand: integer("on_hand").default(0).notNull(),
	minStock: integer("min_stock").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("parts_part_number_unique").on(table.partNumber),
]);

export const movements = pgTable("movements", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	type: movementType().notNull(),
	quantity: integer().notNull(),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "movements_part_id_parts_id_fk"
		}).onDelete("cascade"),
]);
