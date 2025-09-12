"use server";
import { z } from "zod";
import { listParts, updatePart, createPart, deletePart, getPart } from "@/data/parts.repo";
import { createMovement } from "@/data/movements.repo";

export async function listPartsAction(params?: { q?: string; limit?: number; offset?: number }) {
  return listParts(params);
}

const updatePartSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  min_stock: z.coerce.number().int().nonnegative(),
  default_unit_cost: z.coerce.number().nonnegative().optional(),
  default_unit_price: z.coerce.number().nonnegative().optional(),
  tax_rate_pct: z.coerce.number().nonnegative().optional(),
  margin_target_pct: z.coerce.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
});
export async function updatePartAction(input: unknown) {
  const parsed = updatePartSchema.parse(input);
  await updatePart(parsed.id, {
    name: parsed.name,
    min_stock: parsed.min_stock,
    default_unit_cost: parsed.default_unit_cost,
    default_unit_price: parsed.default_unit_price,
    tax_rate_pct: parsed.tax_rate_pct,
    margin_target_pct: parsed.margin_target_pct,
    currency: parsed.currency,
  });
}

const createPartSchema = z.object({
  part_number: z.string().min(1),
  name: z.string().min(1),
  on_hand: z.coerce.number().int().nonnegative().optional(),
  min_stock: z.coerce.number().int().nonnegative().optional(),
  default_unit_cost: z.coerce.number().nonnegative().optional(),
  default_unit_price: z.coerce.number().nonnegative().optional(),
  tax_rate_pct: z.coerce.number().nonnegative().optional(),
  margin_target_pct: z.coerce.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
});
export async function createPartAction(input: unknown) {
  const parsed = createPartSchema.parse(input);
  return createPart(parsed as any);
}

export async function deletePartAction(id: string) {
  await deletePart(id);
}

export async function getPartAction(id: string) {
  return getPart(id);
}

const movementSchema = z.object({ part_id: z.string(), type: z.enum(["IN","OUT","RESERVE","UNRESERVE","CONSUME"]).default("IN"), quantity: z.coerce.number().int(), note: z.string().optional() });
export async function createMovementAction(input: unknown) {
  const parsed = movementSchema.parse(input);
  await createMovement(parsed);
}
