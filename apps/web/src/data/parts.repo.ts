// apps/web/src/data/parts.repo.ts
import { sbAdmin, createSupabaseServerClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/supabase/types";

export async function listParts(opts?: { q?: string; limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = (opts?.offset ?? 0);
  let query = supabase
    .from("parts")
    .select(
      [
        "id",
        "part_number",
        "name",
        "on_hand",
        "min_stock",
        "default_unit_cost",
        "default_unit_price",
        "tax_rate_pct",
        "margin_target_pct",
        "currency",
      ].join(",")
    )
    .range(from, from + limit - 1)
    .order("part_number");
  const q = (opts?.q ?? "").trim();
  if (q) {
    query = query.or(`part_number.ilike.%${q}%,name.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(`listParts: ${error.message}`);
  return (data ?? []) as any[];
}

export async function getPart(id: string | number) {
  const supabase = await createSupabaseServerClient();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { data, error } = await supabase
    .from("parts")
    .select(
      [
        "id",
        "part_number",
        "name",
        "on_hand",
        "min_stock",
        "default_unit_cost",
        "default_unit_price",
        "tax_rate_pct",
        "margin_target_pct",
        "currency",
      ].join(",")
    )
    .eq("id", key as any)
    .single();
  if (error) throw new Error(`getPart: ${error.message}`);
  return data as Part;
}

export async function createPart(input: { part_number: string; name: string; on_hand?: number; min_stock?: number; default_unit_cost?: number | null; default_unit_price?: number | null; tax_rate_pct?: number | null; margin_target_pct?: number | null; currency?: string | null }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("parts")
    .insert({
      part_number: input.part_number,
      name: input.name,
      on_hand: input.on_hand ?? 0,
      min_stock: input.min_stock ?? 0,
      default_unit_cost: input.default_unit_cost ?? null,
      default_unit_price: input.default_unit_price ?? null,
      tax_rate_pct: input.tax_rate_pct ?? 0,
      margin_target_pct: input.margin_target_pct ?? 0,
      currency: input.currency ?? undefined,
    })
    .select("id")
    .single();
  if (error) throw new Error(`createPart: ${error.message}`);
  return data!.id as string;
}

export async function updatePart(id: string | number, patch: Partial<{ name: string; min_stock: number; default_unit_cost: number | null; default_unit_price: number | null; tax_rate_pct: number | null; margin_target_pct: number | null; currency: string | null }>) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase
    .from("parts")
    .update({
      name: patch.name,
      min_stock: patch.min_stock,
      default_unit_cost: patch.default_unit_cost,
      default_unit_price: patch.default_unit_price,
      tax_rate_pct: patch.tax_rate_pct,
      margin_target_pct: patch.margin_target_pct,
      currency: patch.currency as any,
    })
    .eq("id", key as any);
  if (error) throw new Error(`updatePart: ${error.message}`);
}

export async function deletePart(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase.from("parts").delete().eq("id", key as any);
  if (error) throw new Error(`deletePart: ${error.message}`);
}
