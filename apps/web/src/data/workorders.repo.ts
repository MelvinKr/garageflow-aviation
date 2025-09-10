// apps/web/src/data/workorders.repo.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkOrder } from "@/lib/supabase/types";

export async function listWorkOrders(opts?: { status?: string; limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  let query = supabase.from("work_orders").select("*").range(from, from + limit - 1).order("created_at", { ascending: false });
  if (opts?.status) query = query.eq("status", opts.status);
  const { data, error } = await query;
  if (error) throw new Error(`listWorkOrders: ${error.message}`);
  return (data ?? []) as WorkOrder[];
}

export async function getWorkOrder(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("work_orders").select("*").eq("id", id).single();
  if (error) throw new Error(`getWorkOrder: ${error.message}`);
  return data as WorkOrder;
}

export async function createWorkOrder() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("work_orders").insert({}).select("id").single();
  if (error) throw new Error(`createWorkOrder: ${error.message}`);
  return data!.id as string;
}

export async function closeWorkOrder(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("work_orders").update({ closed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(`closeWorkOrder: ${error.message}`);
}

