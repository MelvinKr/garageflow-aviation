import { NextResponse } from "next/server";
import { z } from "zod";
import { sbAdmin } from "@/lib/supabase-server";

const ListSchema = z.object({ part_id: z.coerce.number().int().positive() });
const CreateSchema = z.object({ part_id: z.number().int().positive(), aircraft_id: z.number().int().positive() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ListSchema.safeParse({ part_id: url.searchParams.get("part_id") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { data, error } = await s
    .from("part_compat_aircraft")
    .select("part_id,aircraft_id")
    .eq("part_id", parsed.data.part_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { error } = await s
    .from("part_compat_aircraft")
    .insert(parsed.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const parsed = CreateSchema.safeParse({ part_id: Number(url.searchParams.get("part_id")), aircraft_id: Number(url.searchParams.get("aircraft_id")) });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { error } = await s
    .from("part_compat_aircraft")
    .delete()
    .eq("part_id", parsed.data.part_id)
    .eq("aircraft_id", parsed.data.aircraft_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

