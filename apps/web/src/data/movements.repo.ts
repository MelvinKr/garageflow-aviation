// apps/web/src/data/movements.repo.ts
import { sbAdmin, createSupabaseServerClient } from "@/lib/supabase/server";
import type { MovementType } from "@/lib/supabase/types";

export async function listMovements(opts?: { part_id?: number; limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  let query = supabase
    .from("movements")
    .select("id,part_id,type,quantity,note,created_at")
    .range(from, from + limit - 1)
    .order("created_at", { ascending: false });
  if (opts?.part_id) query = query.eq("part_id", opts.part_id);
  const { data, error } = await query;
  if (error) throw new Error(`listMovements: ${error.message}`);
  return (data ?? []) as any[];
}

export async function createMovement(input: { part_id: number; type: MovementType; quantity: number; note?: string | null }) {
  const supabase = sbAdmin();
  // Map app-level types to DB enum (CONSUME, RECEIVE, ADJUST)
  const t = String(input.type).toUpperCase();
  const dbType =
    t === "IN" ? "RECEIVE" :
    t === "OUT" ? "CONSUME" :
    t === "RECEIVE" ? "RECEIVE" :
    t === "CONSUME" ? "CONSUME" :
    t === "ADJUST" ? "ADJUST" : undefined;
  if (!dbType) throw new Error(`Unsupported movement type: ${input.type}`);
  const { error } = await supabase
    .from("movements")
    .insert({ part_id: input.part_id, type: dbType as any, quantity: input.quantity, note: input.note ?? null });
  if (error) throw new Error(`createMovement: ${error.message}`);
}
