// apps/web/src/data/movements.repo.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Movement, MovementType } from "@/lib/supabase/types";

export async function listMovements(opts?: { part_id?: string; limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  let query = supabase.from("movements").select("*").range(from, from + limit - 1).order("created_at", { ascending: false });
  if (opts?.part_id) query = query.eq("part_id", opts.part_id);
  const { data, error } = await query;
  if (error) throw new Error(`listMovements: ${error.message}`);
  return (data ?? []) as Movement[];
}

export async function createMovement(input: { part_id: string; type: MovementType; quantity: number; note?: string | null }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("movements").insert({
    part_id: input.part_id,
    type: input.type,
    quantity: input.quantity,
    note: input.note ?? null,
  });
  if (error) throw new Error(`createMovement: ${error.message}`);
}

