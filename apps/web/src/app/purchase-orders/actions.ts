"use server";
import { z } from "zod";
import { addPoItem, createPurchaseOrder, getPurchaseOrder, listPurchaseOrders, receivePoItem, updatePurchaseOrder } from "@/data/purchaseOrders.repo";

export async function listPOsAction(params?: { limit?: number; offset?: number }) {
  return listPurchaseOrders(params);
}

export async function getPOAction(id: string) {
  return getPurchaseOrder(id);
}

export async function createPOAction(input: unknown) {
  const schema = z.object({ supplier_id: z.string().nullable().optional(), expected_at: z.string().nullable().optional() }).optional();
  const parsed = schema.parse(input) ?? {};
  return createPurchaseOrder(parsed);
}

export async function updatePOAction(input: unknown) {
  const schema = z.object({ id: z.string(), supplier_id: z.string().nullable().optional(), status: z.enum(["draft","ordered","partially_received","received","cancelled"]).optional(), expected_at: z.string().nullable().optional() });
  const { id, ...patch } = schema.parse(input);
  await updatePurchaseOrder(id, patch);
}

export async function addPoItemAction(input: unknown) {
  const schema = z.object({ po_id: z.string(), part_id: z.string(), qty: z.coerce.number().int().positive(), unit_cost: z.coerce.number().optional() });
  const parsed = schema.parse(input);
  return addPoItem(parsed.po_id, { part_id: parsed.part_id, qty: parsed.qty, unit_cost: parsed.unit_cost });
}

export async function receivePoItemAction(input: unknown) {
  const schema = z.object({ po_id: z.string(), item_id: z.string(), qty: z.coerce.number().int().positive() });
  const parsed = schema.parse(input);
  await receivePoItem(parsed.po_id, parsed.item_id, parsed.qty);
}

