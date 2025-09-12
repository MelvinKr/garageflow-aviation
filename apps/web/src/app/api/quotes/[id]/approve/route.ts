import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = sbAdmin();

  // 1) Load quote
  const { data: quote, error: qe } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", params.id)
    .single();
  if (qe) return NextResponse.json({ error: qe.message }, { status: 404 });

  // 1b) Load quote items
  const { data: items, error: ie } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", params.id);
  if (ie) return NextResponse.json({ error: ie.message }, { status: 400 });

  // 2) Create Work Order (status fields depend on your schema)
  const { data: wo, error: we } = await supabase
    .from("work_orders")
    .insert({ /* status: 'Planned', customer_id: quote.customer_id */ })
    .select()
    .single();
  if (we) return NextResponse.json({ error: we.message }, { status: 400 });

  // 3) Reserve parts
  const woParts = (items ?? [])
    .filter((i: any) => i.part_id && i.quantity > 0)
    .map((i: any) => ({ work_order_id: wo.id, part_id: i.part_id!, quantity: i.quantity }));

  if (woParts.length) {
    const { error: wpe } = await supabase.from("work_order_parts").insert(woParts);
    if (wpe) return NextResponse.json({ error: wpe.message }, { status: 400 });
  }

  // 4) Update quote status
  const { error: upqe } = await supabase
    .from("quotes")
    .update({ status: "APPROVED" })
    .eq("id", params.id);
  if (upqe) return NextResponse.json({ error: upqe.message }, { status: 400 });

  return NextResponse.json({ work_order_id: wo.id }, { status: 201 });
}

