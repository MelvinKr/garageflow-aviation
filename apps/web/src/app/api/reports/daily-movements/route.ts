import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const s = await createSupabaseServerClient();
  let q = s.from("v_daily_movements").select("*");
  if (from) q = q.gte("day", from);
  if (to) q = q.lte("day", to);
  const { data, error } = await q.order("day");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

