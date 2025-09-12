import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toCSV } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const low = url.searchParams.get("lowStock") === "1";

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("parts")
      .select("id,part_number,name,on_hand,min_stock")
      .limit(5000);

    const parts = (data ?? []).map((p: any) => ({
      id: p.id,
      sku: p.part_number,
      name: p.name,
      qty: Number(p.on_hand ?? 0),
      min: Number(p.min_stock ?? 0),
    }));

    const rows = low ? parts.filter((p) => (p.qty ?? 0) <= (p.min ?? 0)) : parts;
    const csv = toCSV(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="parts${low ? "_low" : ""}.csv"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "export failed" }, { status: 500 });
  }
}

