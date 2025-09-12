import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE);
  let adminOk = false;
  let partsCount: number | null = null;
  let error: string | null = null;
  try {
    const { count, error: e } = await sbAdmin()
      .from("parts")
      .select("id", { count: "exact", head: true });
    if (e) throw e;
    adminOk = true;
    partsCount = count ?? null;
  } catch (e: any) {
    error = e?.message || String(e);
  }
  return NextResponse.json({
    hasService,
    adminOk,
    partsCount,
    // do not echo secrets/env values
    supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  });
}

