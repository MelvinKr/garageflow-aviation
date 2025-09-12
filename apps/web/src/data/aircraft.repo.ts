import { sbAdmin, createSupabaseServerClient } from "@/lib/supabase/server";

export type Aircraft = {
  id: number;
  registration: string;
  model?: string | null;
  hours_total?: number | null;
  cycles_total?: number | null;
  next_due_at?: string | null; // ISO date
  created_at?: string | null;
  updated_at?: string | null;
};

export async function listAircraft(opts?: { limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 500);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("aircraft")
    .select("id,registration,model,hours_total,cycles_total,next_due_at,created_at,updated_at")
    .range(from, from + limit - 1)
    .order("registration");
  if (error) throw new Error(`listAircraft: ${error.message}`);
  return (data ?? []) as Aircraft[];
}

export async function getAircraft(id: string | number) {
  const supabase = await createSupabaseServerClient();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { data, error } = await supabase
    .from("aircraft")
    .select("id,registration,model,hours_total,cycles_total,next_due_at,created_at,updated_at")
    .eq("id", key as any)
    .single();
  if (error) throw new Error(`getAircraft: ${error.message}`);
  return data as Aircraft;
}

export async function createAircraft(input: {
  registration: string;
  model?: string | null;
  hours_total?: number | null;
  cycles_total?: number | null;
  next_due_at?: string | null; // ISO date
}) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("aircraft")
    .insert({
      registration: input.registration,
      model: input.model ?? null,
      hours_total: input.hours_total ?? 0,
      cycles_total: input.cycles_total ?? 0,
      next_due_at: input.next_due_at ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`createAircraft: ${error.message}`);
  return data!.id as number;
}

export async function updateAircraft(
  id: string | number,
  patch: Partial<{
    registration: string;
    model: string | null;
    hours_total: number | null;
    cycles_total: number | null;
    next_due_at: string | null;
  }>
) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase
    .from("aircraft")
    .update({
      registration: patch.registration,
      model: patch.model,
      hours_total: patch.hours_total,
      cycles_total: patch.cycles_total,
      next_due_at: patch.next_due_at,
    })
    .eq("id", key as any);
  if (error) throw new Error(`updateAircraft: ${error.message}`);
}

export async function deleteAircraft(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase.from("aircraft").delete().eq("id", key as any);
  if (error) throw new Error(`deleteAircraft: ${error.message}`);
}
