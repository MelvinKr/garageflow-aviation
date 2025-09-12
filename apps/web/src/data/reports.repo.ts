// apps/web/src/data/reports.repo.ts
import { sbAdmin, createSupabaseServerClient } from "@/lib/supabase/server";

// Generic helpers to read reporting views

export async function viewPartStock() {
  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase.from("v_part_stock").select("*");
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data, error } = await admin.from("v_part_stock").select("*"));
  }
  if (error) throw new Error(`viewPartStock: ${error.message}`);
  return data as any[];
}

export async function viewStockValuation() {
  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase.from("v_stock_valuation").select("*");
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data, error } = await admin.from("v_stock_valuation").select("*"));
  }
  if (error) throw new Error(`viewStockValuation: ${error.message}`);
  return data as any[];
}

export async function viewDailyMovements(params?: { from?: string; to?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("v_daily_movements").select("*");
  if (params?.from) query = query.gte("day", params.from);
  if (params?.to) query = query.lte("day", params.to);
  let { data, error } = await query.order("day");
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    let q2 = admin.from("v_daily_movements").select("*");
    if (params?.from) q2 = q2.gte("day", params.from);
    if (params?.to) q2 = q2.lte("day", params.to);
    ({ data, error } = await q2.order("day"));
  }
  if (error) throw new Error(`viewDailyMovements: ${error.message}`);
  return data as any[];
}

export async function viewMonthlyActivity(params?: { months?: number }) {
  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase
    .from("v_monthly_activity")
    .select("*")
    .order("month");
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data, error } = await admin
      .from("v_monthly_activity")
      .select("*")
      .order("month"));
  }
  if (error) throw new Error(`viewMonthlyActivity: ${error.message}`);
  const limit = Math.max(1, Math.min(60, params?.months ?? 12));
  return (data ?? []).slice(-limit);
}

export async function viewKpiSummary() {
  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase.from("v_kpi_summary").select("*").single();
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data, error } = await admin.from("v_kpi_summary").select("*").single());
  }
  if (error) throw new Error(`viewKpiSummary: ${error.message}`);
  return data as Record<string, any>;
}
