import { NextResponse } from "next/server";
import { z } from "zod";
import { sbAdmin } from "@/lib/supabase-server";

const ConsumeDTO = z.object({
  work_order_part_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unit_cost: z.number().nonnegative().default(0).optional(),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = ConsumeDTO.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const supabase = sbAdmin();

  // 1) Load work_order_part to get part_id
  const { data: wop, error: wopErr } = await supabase
    .from("work_order_parts")
    .select("id, part_id")
    .eq("id", parsed.data.work_order_part_id)
    .single();
  if (wopErr) return NextResponse.json({ error: wopErr.message }, { status: 404 });

  // 2) Create movement OUT
  const payload: any = {
    part_id: wop.part_id,
    type: "CONSUME",
    quantity: parsed.data.quantity,
    note: parsed.data.note ?? null,
  };
  if (typeof parsed.data.unit_cost === "number") payload.unit_cost = parsed.data.unit_cost;

  const { data: mv, error: me } = await supabase
    .from("movements")
    .insert(payload)
    .select()
    .single();
  if (me) return NextResponse.json({ error: me.message }, { status: 400 });

  // 3) Mark consumed
  const { error: ce } = await supabase
    .from("work_order_parts")
    .update({ consumed_at: new Date().toISOString(), movement_id: mv.id })
    .eq("id", wop.id);
  if (ce) return NextResponse.json({ error: ce.message }, { status: 400 });

  return NextResponse.json({ movement_id: mv.id }, { status: 201 });
}
