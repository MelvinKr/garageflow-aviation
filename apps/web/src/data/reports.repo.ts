// apps/web/src/data/reports.repo.ts
import { sbAdmin } from "@/lib/supabase/server";

// Generic helpers to read reporting views

export async function viewPartStock() {
  const supabase = sbAdmin();
  const { data, error } = await supabase.from("v_part_stock").select("*");
  if (error) throw new Error(`viewPartStock: ${error.message}`);
  return data as any[];
}

export async function viewStockValuation() {
  const supabase = sbAdmin();
  const { data, error } = await supabase.from("v_stock_valuation").select("*");
  if (error) throw new Error(`viewStockValuation: ${error.message}`);
  return data as any[];
}

export async function viewDailyMovements(params?: { from?: string; to?: string }) {
  const supabase = sbAdmin();
  let query = supabase.from("v_daily_movements").select("*");
  if (params?.from) query = query.gte("day", params.from);
  if (params?.to) query = query.lte("day", params.to);
  const { data, error } = await query.order("day");
  if (error) throw new Error(`viewDailyMovements: ${error.message}`);
  return data as any[];
}

export async function viewMonthlyActivity(params?: { months?: number }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("v_monthly_activity")
    .select("*")
    .order("month");
  if (error) throw new Error(`viewMonthlyActivity: ${error.message}`);
  const limit = Math.max(1, Math.min(60, params?.months ?? 12));
  return (data ?? []).slice(-limit);
}

export async function viewKpiSummary() {
  const supabase = sbAdmin();
  const { data, error } = await supabase.from("v_kpi_summary").select("*").single();
  if (error) throw new Error(`viewKpiSummary: ${error.message}`);
  return data as Record<string, any>;
}
