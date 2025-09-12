import { NextResponse } from "next/server";
import { z } from "zod";
import { sbAdmin } from "@/lib/supabase-server";

const MovementDTO = z.object({
  part_id: z.number().int().positive(),
  type: z.enum(["IN", "OUT", "ADJUST", "RECEIVE", "CONSUME"]),
  quantity: z.number().int().refine((n) => n !== 0, { message: "quantity cannot be 0" }),
  unit_cost: z.number().nonnegative().default(0).optional(),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = MovementDTO.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const supabase = sbAdmin();
  // Map app types to DB enum (RECEIVE, CONSUME, ADJUST)
  const t = String(parsed.data.type).toUpperCase();
  const dbType =
    t === "IN" ? "RECEIVE" :
    t === "OUT" ? "CONSUME" :
    t === "RECEIVE" ? "RECEIVE" :
    t === "CONSUME" ? "CONSUME" :
    t === "ADJUST" ? "ADJUST" : undefined;
  if (!dbType) return NextResponse.json({ error: `Unsupported movement type: ${parsed.data.type}` }, { status: 400 });
  const payload: any = {
    part_id: parsed.data.part_id,
    type: dbType,
    quantity: parsed.data.quantity,
    note: parsed.data.note ?? null,
  };
  if (typeof parsed.data.unit_cost === "number") payload.unit_cost = parsed.data.unit_cost;

  // DB triggers should enforce on_hand and disallow negative stock
  const { data, error } = await supabase.from("movements").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
