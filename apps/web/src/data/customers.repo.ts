import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  terms?: string | null;
};

export async function listCustomers(opts?: { limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 500);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("customers")
    .select("id,name,email,phone,terms")
    .range(from, from + limit - 1)
    .order("name");
  if (error) throw new Error(`listCustomers: ${error.message}`);
  return (data ?? []) as Customer[];
}

