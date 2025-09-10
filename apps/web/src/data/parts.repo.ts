// apps/web/src/data/parts.repo.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/supabase/types";

export async function listParts(opts?: { q?: string; limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = (opts?.offset ?? 0);
  let query = supabase.from("parts").select("*", { count: "exact" }).range(from, from + limit - 1).order("part_number");
  const q = (opts?.q ?? "").trim();
  if (q) {
    query = query.or(`part_number.ilike.%${q}%,name.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(`listParts: ${error.message}`);
  return (data ?? []) as Part[];
}

export async function getPart(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("parts").select("*").eq("id", id).single();
  if (error) throw new Error(`getPart: ${error.message}`);
  return data as Part;
}

export async function createPart(input: { part_number: string; name: string; on_hand?: number; min_stock?: number }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("parts")
    .insert({ part_number: input.part_number, name: input.name, on_hand: input.on_hand ?? 0, min_stock: input.min_stock ?? 0 })
    .select("id")
    .single();
  if (error) throw new Error(`createPart: ${error.message}`);
  return data!.id as string;
}

export async function updatePart(id: string, patch: Partial<Pick<Part, "name" | "min_stock">>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("parts").update({ name: patch.name, min_stock: patch.min_stock }).eq("id", id);
  if (error) throw new Error(`updatePart: ${error.message}`);
}

export async function deletePart(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("parts").delete().eq("id", id);
  if (error) throw new Error(`deletePart: ${error.message}`);
}

