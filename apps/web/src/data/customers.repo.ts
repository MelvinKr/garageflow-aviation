import { sbAdmin } from "@/lib/supabase/server";

export type Customer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  billing_address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function listCustomers(opts?: { limit?: number; offset?: number }) {
  const supabase = sbAdmin();
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 500);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("customers")
    .select("id,name,email,phone,billing_address,created_at,updated_at")
    .range(from, from + limit - 1)
    .order("name");
  if (error) throw new Error(`listCustomers: ${error.message}`);
  return (data ?? []) as Customer[];
}

export async function getCustomer(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { data, error } = await supabase
    .from("customers")
    .select("id,name,email,phone,billing_address,created_at,updated_at")
    .eq("id", key as any)
    .single();
  if (error) throw new Error(`getCustomer: ${error.message}`);
  return data as Customer;
}

export async function createCustomer(input: { name: string; email?: string | null; phone?: string | null; billing_address?: string | null }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("customers")
    .insert({ name: input.name, email: input.email ?? null, phone: input.phone ?? null, billing_address: input.billing_address ?? null })
    .select("id")
    .single();
  if (error) throw new Error(`createCustomer: ${error.message}`);
  return data!.id as number;
}

export async function updateCustomer(id: string | number, patch: Partial<{ name: string; email: string | null; phone: string | null; billing_address: string | null }>) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase
    .from("customers")
    .update({ name: patch.name, email: patch.email, phone: patch.phone, billing_address: patch.billing_address })
    .eq("id", key as any);
  if (error) throw new Error(`updateCustomer: ${error.message}`);
}

export async function deleteCustomer(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase.from("customers").delete().eq("id", key as any);
  if (error) throw new Error(`deleteCustomer: ${error.message}`);
}
