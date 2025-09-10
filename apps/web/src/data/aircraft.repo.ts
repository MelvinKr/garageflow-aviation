import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Aircraft = { id: string; reg: string; type?: string | null };

export async function listAircraft(opts?: { limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 500);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("aircraft")
    .select("id,reg,type")
    .range(from, from + limit - 1)
    .order("reg");
  if (error) throw new Error(`listAircraft: ${error.message}`);
  return (data ?? []) as Aircraft[];
}

