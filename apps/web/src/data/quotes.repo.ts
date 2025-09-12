// apps/web/src/data/quotes.repo.ts
import { sbAdmin } from "@/lib/supabase/server";
import type { Quote, QuoteStatus } from "@/lib/supabase/types";

export async function listQuotes(opts?: { status?: QuoteStatus; limit?: number; offset?: number }) {
  const supabase = sbAdmin();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  let query = supabase.from("quotes").select("*").range(from, from + limit - 1).order("created_at", { ascending: false });
  if (opts?.status) query = query.eq("status", opts.status.toString().toUpperCase());
  const { data, error } = await query;
  if (error) throw new Error(`listQuotes: ${error.message}`);
  const rows = (data ?? []).map((q: any) => ({
    ...q,
    status: String(q.status ?? "DRAFT").toLowerCase(),
  }));
  return rows as Quote[];
}

export async function getQuote(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { data, error } = await supabase.from("quotes").select("*").eq("id", key as any).single();
  if (error) throw new Error(`getQuote: ${error.message}`);
  const row = data ? { ...data, status: String((data as any).status ?? "DRAFT").toLowerCase() } : data;
  return row as Quote;
}

export async function createQuote(input: { total_amount?: number; status?: QuoteStatus }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("quotes")
    .insert({ total_amount: input.total_amount ?? 0, status: (input.status ?? "draft").toString().toUpperCase() })
    .select("id")
    .single();
  if (error) throw new Error(`createQuote: ${error.message}`);
  return data!.id as string;
}

export async function updateQuote(id: string | number, patch: Partial<Pick<Quote, "status" | "total_amount">>) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase
    .from("quotes")
    .update({
      status: patch.status ? patch.status.toString().toUpperCase() : undefined,
      total_amount: patch.total_amount,
    })
    .eq("id", key as any);
  if (error) throw new Error(`updateQuote: ${error.message}`);
}
