import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = sbAdmin();
  const id = Number.isNaN(Number(params.id)) ? params.id : Number(params.id);
  const { data, error } = await supabase.from("parts").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

