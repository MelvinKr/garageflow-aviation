// apps/web/src/data/quotes.repo.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Quote, QuoteStatus } from "@/lib/supabase/types";

export async function listQuotes(opts?: { status?: QuoteStatus; limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  let query = supabase.from("quotes").select("*").range(from, from + limit - 1).order("created_at", { ascending: false });
  if (opts?.status) query = query.eq("status", opts.status);
  const { data, error } = await query;
  if (error) throw new Error(`listQuotes: ${error.message}`);
  return (data ?? []) as Quote[];
}

export async function getQuote(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("quotes").select("*").eq("id", id).single();
  if (error) throw new Error(`getQuote: ${error.message}`);
  return data as Quote;
}

export async function createQuote(input: { total_amount?: number; status?: QuoteStatus }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({ total_amount: input.total_amount ?? 0, status: input.status ?? "draft" })
    .select("id")
    .single();
  if (error) throw new Error(`createQuote: ${error.message}`);
  return data!.id as string;
}

export async function updateQuote(id: string, patch: Partial<Pick<Quote, "status" | "total_amount">>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("quotes").update({ status: patch.status, total_amount: patch.total_amount }).eq("id", id);
  if (error) throw new Error(`updateQuote: ${error.message}`);
}

