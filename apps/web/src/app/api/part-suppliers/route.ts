import { NextResponse } from "next/server";
import { z } from "zod";
import { sbAdmin } from "@/lib/supabase-server";

const ListSchema = z.object({ part_id: z.coerce.number().int().positive() });
const CreateSchema = z.object({ part_id: z.number().int().positive(), supplier_id: z.number().int().positive(), last_price: z.number().nonnegative().nullable().optional(), lead_time_days: z.number().int().nonnegative().nullable().optional() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ListSchema.safeParse({ part_id: url.searchParams.get("part_id") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { data, error } = await s
    .from("part_suppliers")
    .select("id,part_id,supplier_id,last_price,lead_time_days,created_at,updated_at")
    .eq("part_id", parsed.data.part_id)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { data, error } = await s
    .from("part_suppliers")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data!.id }, { status: 201 });
}

