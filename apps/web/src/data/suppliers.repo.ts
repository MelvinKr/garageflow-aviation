import { sbAdmin } from "@/lib/supabase/server";

export type Supplier = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  terms?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function listSuppliers(opts?: { limit?: number; offset?: number }) {
  const supabase = sbAdmin();
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 500);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("suppliers")
    .select("id,name,email,phone,terms,created_at,updated_at")
    .range(from, from + limit - 1)
    .order("name");
  if (error) throw new Error(`listSuppliers: ${error.message}`);
  return (data ?? []) as Supplier[];
}

export async function getSupplier(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { data, error } = await supabase
    .from("suppliers")
    .select("id,name,email,phone,terms,created_at,updated_at")
    .eq("id", key as any)
    .single();
  if (error) throw new Error(`getSupplier: ${error.message}`);
  return data as Supplier;
}

export async function createSupplier(input: { name: string; email?: string | null; phone?: string | null; terms?: string | null }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({ name: input.name, email: input.email ?? null, phone: input.phone ?? null, terms: input.terms ?? null })
    .select("id")
    .single();
  if (error) throw new Error(`createSupplier: ${error.message}`);
  return data!.id as number;
}

export async function updateSupplier(id: string | number, patch: Partial<{ name: string; email: string | null; phone: string | null; terms: string | null }>) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase
    .from("suppliers")
    .update({ name: patch.name, email: patch.email, phone: patch.phone, terms: patch.terms })
    .eq("id", key as any);
  if (error) throw new Error(`updateSupplier: ${error.message}`);
}

export async function deleteSupplier(id: string | number) {
  const supabase = await createSupabaseServerClient();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase.from("suppliers").delete().eq("id", key as any);
  if (error) throw new Error(`deleteSupplier: ${error.message}`);
}
