"use server";
import { z } from "zod";
import { listWorkOrders, createWorkOrder, closeWorkOrder } from "@/data/workorders.repo";

export async function listWorkOrdersAction(params?: { limit?: number; offset?: number }) {
  return listWorkOrders({ limit: params?.limit, offset: params?.offset });
}

export async function createWorkOrderAction() {
  return createWorkOrder();
}

const closeSchema = z.object({ id: z.string() });
export async function closeWorkOrderAction(input: unknown) {
  const { id } = closeSchema.parse(input);
  await closeWorkOrder(id);
}

