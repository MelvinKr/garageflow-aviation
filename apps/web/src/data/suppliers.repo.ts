import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Supplier = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  currency?: string | null;
  lead_time_days?: number | null;
};

export async function listSuppliers(opts?: { limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 500);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("suppliers")
    .select("id,name,email,phone,currency,lead_time_days")
    .range(from, from + limit - 1)
    .order("name");
  if (error) throw new Error(`listSuppliers: ${error.message}`);
  return (data ?? []) as Supplier[];
}

