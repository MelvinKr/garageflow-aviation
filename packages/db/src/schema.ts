import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }),
  phone: varchar('phone', { length: 64 }),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const aircrafts = pgTable('aircrafts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tailNumber: varchar('tail_number', { length: 64 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 128 }),
  model: varchar('model', { length: 128 }),
  year: integer('year'),
  ownerId: uuid('owner_id').references(() => customers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const parts = pgTable('parts', {
  id: uuid('id').defaultRandom().primaryKey(),
  partNumber: varchar('part_number', { length: 128 }).notNull().unique(),
  description: text('description'),
  quantityInStock: integer('quantity_in_stock').default(0).notNull(),
  location: varchar('location', { length: 128 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workOrders = pgTable('work_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  aircraftId: uuid('aircraft_id').references(() => aircrafts.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 32 }).default('open').notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workItems = pgTable('work_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  workOrderId: uuid('work_order_id').references(() => workOrders.id, { onDelete: 'cascade' }).notNull(),
  partId: uuid('part_id').references(() => parts.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  laborHours: numeric('labor_hours', { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  aircrafts: many(aircrafts),
  workOrders: many(workOrders),
}));

export const aircraftsRelations = relations(aircrafts, ({ one, many }) => ({
  owner: one(customers, {
    fields: [aircrafts.ownerId],
    references: [customers.id],
  }),
  workOrders: many(workOrders),
}));

export const partsRelations = relations(parts, ({ many }) => ({
  workItems: many(workItems),
}));

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [workOrders.customerId],
    references: [customers.id],
  }),
  aircraft: one(aircrafts, {
    fields: [workOrders.aircraftId],
    references: [aircrafts.id],
  }),
  items: many(workItems),
}));

export const workItemsRelations = relations(workItems, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workItems.workOrderId],
    references: [workOrders.id],
  }),
  part: one(parts, {
    fields: [workItems.partId],
    references: [parts.id],
  }),
}));

export const schema = {
  customers,
  aircrafts,
  parts,
  workOrders,
  workItems,
};

