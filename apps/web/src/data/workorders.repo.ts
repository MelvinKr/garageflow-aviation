// apps/web/src/data/workorders.repo.ts
import { sbAdmin } from "@/lib/supabase/server";
import type { WorkOrder } from "@/lib/supabase/types";

export async function listWorkOrders(opts?: { limit?: number; offset?: number }) {
  const supabase = sbAdmin();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("work_orders")
    .select("*")
    .range(from, from + limit - 1)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listWorkOrders: ${error.message}`);
  return (data ?? []) as WorkOrder[];
}

export async function getWorkOrder(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { data, error } = await supabase.from("work_orders").select("*").eq("id", key as any).single();
  if (error) throw new Error(`getWorkOrder: ${error.message}`);
  return data as WorkOrder;
}

export async function createWorkOrder() {
  const supabase = sbAdmin();
  const { data, error } = await supabase.from("work_orders").insert({}).select("id").single();
  if (error) throw new Error(`createWorkOrder: ${error.message}`);
  return data!.id as string;
}

export async function closeWorkOrder(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase.from("work_orders").update({ closed_at: new Date().toISOString() }).eq("id", key as any);
  if (error) throw new Error(`closeWorkOrder: ${error.message}`);
}
