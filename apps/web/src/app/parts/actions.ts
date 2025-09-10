"use server";
import { z } from "zod";
import { listParts, updatePart, createPart, deletePart, getPart } from "@/data/parts.repo";
import { createMovement } from "@/data/movements.repo";

export async function listPartsAction(params?: { q?: string; limit?: number; offset?: number }) {
  return listParts(params);
}

const updatePartSchema = z.object({ id: z.string(), name: z.string().min(1), min_stock: z.coerce.number().int().nonnegative() });
export async function updatePartAction(input: unknown) {
  const { id, name, min_stock } = updatePartSchema.parse(input);
  await updatePart(id, { name, min_stock });
}

const createPartSchema = z.object({ part_number: z.string().min(1), name: z.string().min(1), on_hand: z.coerce.number().int().nonnegative().optional(), min_stock: z.coerce.number().int().nonnegative().optional() });
export async function createPartAction(input: unknown) {
  const parsed = createPartSchema.parse(input);
  return createPart(parsed);
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
