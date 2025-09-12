import { NextResponse } from "next/server";
import { z } from "zod";
import { sbAdmin } from "@/lib/supabase-server";

const PatchSchema = z.object({ last_price: z.number().nonnegative().nullable().optional(), lead_time_days: z.number().int().nonnegative().nullable().optional() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const s = sbAdmin();
  const { error } = await s
    .from("part_suppliers")
    .update(parsed.data)
    .eq("id", Number(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const s = sbAdmin();
  const { error } = await s
    .from("part_suppliers")
    .delete()
    .eq("id", Number(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

