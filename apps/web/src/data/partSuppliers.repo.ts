// apps/web/src/data/partSuppliers.repo.ts
import { sbAdmin } from "@/lib/supabase/server";

export interface PartSupplierRow {
  id: number;
  part_id: number;
  supplier_id: number;
  last_price?: number | null;
  lead_time_days?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function listPartSuppliers(part_id: number) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("part_suppliers")
    .select("id,part_id,supplier_id,last_price,lead_time_days,created_at,updated_at")
    .eq("part_id", part_id)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`listPartSuppliers: ${error.message}`);
  return (data ?? []) as PartSupplierRow[];
}

export async function createPartSupplier(input: { part_id: number; supplier_id: number; last_price?: number | null; lead_time_days?: number | null }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("part_suppliers")
    .insert({
      part_id: input.part_id,
      supplier_id: input.supplier_id,
      last_price: input.last_price ?? null,
      lead_time_days: input.lead_time_days ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`createPartSupplier: ${error.message}`);
  return data!.id as number;
}

export async function updatePartSupplier(id: string | number, patch: Partial<{ last_price: number | null; lead_time_days: number | null }>) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase
    .from("part_suppliers")
    .update({ last_price: patch.last_price, lead_time_days: patch.lead_time_days })
    .eq("id", key as any);
  if (error) throw new Error(`updatePartSupplier: ${error.message}`);
}

export async function deletePartSupplier(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase.from("part_suppliers").delete().eq("id", key as any);
  if (error) throw new Error(`deletePartSupplier: ${error.message}`);
}
