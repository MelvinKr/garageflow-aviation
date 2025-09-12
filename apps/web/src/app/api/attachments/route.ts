import { NextResponse } from "next/server";
import { z } from "zod";
import { sbAdmin } from "@/lib/supabase-server";

const ListSchema = z.object({ entity_type: z.enum(["part","movement","quote","work_order","purchase_order"]), entity_id: z.coerce.number().int().positive() });
const CreateSchema = z.object({ entity_type: z.enum(["part","movement","quote","work_order","purchase_order"]), entity_id: z.number().int().positive(), url: z.string().url(), mime_type: z.string().optional() });
const DeleteSchema = z.object({ id: z.coerce.number().int().positive() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ListSchema.safeParse({ entity_type: url.searchParams.get("entity_type"), entity_id: url.searchParams.get("entity_id") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { data, error } = await s
    .from("attachments")
    .select("id,entity_type,entity_id,url,mime_type,created_at,updated_at")
    .eq("entity_type", parsed.data.entity_type)
    .eq("entity_id", parsed.data.entity_id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { data, error } = await s
    .from("attachments")
    .insert({ ...parsed.data })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data!.id }, { status: 201 });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const parsed = DeleteSchema.safeParse({ id: url.searchParams.get("id") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { error } = await s.from("attachments").delete().eq("id", parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

