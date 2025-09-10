import { relations } from "drizzle-orm/relations";
import { parts, movements } from "./schema";

export const movementsRelations = relations(movements, ({one}) => ({
	part: one(parts, {
		fields: [movements.partId],
		references: [parts.id]
	}),
}));

export const partsRelations = relations(parts, ({many}) => ({
	movements: many(movements),
}));