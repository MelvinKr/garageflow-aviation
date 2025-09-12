import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const underMin = url.searchParams.get("underMin") === "true";

  const supabase = sbAdmin();
  let query = supabase
    .from("parts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (q) {
    const like = `%${q}%`;
    // Search on name OR part_number
    query = query.or(`name.ilike.${like},part_number.ilike.${like}`);
  }
  if (underMin) query = query.lt("on_hand", "min_stock");

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

