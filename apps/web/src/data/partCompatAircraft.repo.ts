// apps/web/src/data/partCompatAircraft.repo.ts
import { sbAdmin, createSupabaseServerClient } from "@/lib/supabase/server";

export interface PartCompatRow {
  part_id: number;
  aircraft_id: number;
}

export async function listPartCompatibleAircraft(part_id: number) {
  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase
    .from("part_compat_aircraft")
    .select("part_id,aircraft_id")
    .eq("part_id", part_id);
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data, error } = await admin
      .from("part_compat_aircraft")
      .select("part_id,aircraft_id")
      .eq("part_id", part_id));
  }
  if (error) throw new Error(`listPartCompatibleAircraft: ${error.message}`);
  return (data ?? []) as PartCompatRow[];
}

export async function addPartCompatibility(part_id: number, aircraft_id: number) {
  const supabase = sbAdmin();
  const { error } = await supabase
    .from("part_compat_aircraft")
    .insert({ part_id, aircraft_id });
  if (error) throw new Error(`addPartCompatibility: ${error.message}`);
}

export async function removePartCompatibility(part_id: number, aircraft_id: number) {
  const supabase = sbAdmin();
  const { error } = await supabase
    .from("part_compat_aircraft")
    .delete()
    .eq("part_id", part_id)
    .eq("aircraft_id", aircraft_id);
  if (error) throw new Error(`removePartCompatibility: ${error.message}`);
}
