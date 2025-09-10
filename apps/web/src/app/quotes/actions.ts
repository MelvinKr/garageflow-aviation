"use server";
import { z } from "zod";
import { listQuotes, createQuote, updateQuote } from "@/data/quotes.repo";
import type { QuoteStatus } from "@/lib/supabase/types";

export async function listQuotesAction(params?: { status?: QuoteStatus; limit?: number; offset?: number }) {
  return listQuotes(params);
}

const createSchema = z.object({ total_amount: z.coerce.number().optional(), status: z.enum(["draft","sent","accepted","rejected"]).optional() });
export async function createQuoteAction(input: unknown) {
  const parsed = createSchema.parse(input);
  return createQuote(parsed);
}

const updateSchema = z.object({ id: z.string(), status: z.enum(["draft","sent","accepted","rejected"]).optional(), total_amount: z.coerce.number().optional() });
export async function updateQuoteAction(input: unknown) {
  const parsed = updateSchema.parse(input);
  await updateQuote(parsed.id, { status: parsed.status, total_amount: parsed.total_amount });
}

