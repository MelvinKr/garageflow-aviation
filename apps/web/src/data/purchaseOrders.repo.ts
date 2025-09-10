// apps/web/src/data/purchaseOrders.repo.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createMovement } from "./movements.repo";

export type PoStatus = "draft" | "ordered" | "partially_received" | "received" | "cancelled";

export async function listPurchaseOrders(opts?: { limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("id,supplier_id,status,expected_at,created_at")
    .range(from, from + limit - 1)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listPurchaseOrders: ${error.message}`);
  return data ?? [];
}

export async function getPurchaseOrder(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: po, error } = await supabase
    .from("purchase_orders")
    .select("id,supplier_id,status,expected_at,created_at")
    .eq("id", id)
    .single();
  if (error) throw new Error(`getPurchaseOrder: ${error.message}`);
  const { data: items, error: e2 } = await supabase
    .from("po_items")
    .select("id,part_id,qty,unit_cost,received_qty,created_at")
    .eq("po_id", id)
    .order("created_at", { ascending: false });
  if (e2) throw new Error(`getPurchaseOrder items: ${e2.message}`);
  return { ...po, items: items ?? [] } as any;
}

export async function createPurchaseOrder(input?: { supplier_id?: string | null; expected_at?: string | null }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .insert({ supplier_id: input?.supplier_id ?? null, expected_at: input?.expected_at ?? null, status: "ordered" })
    .select("id")
    .single();
  if (error) throw new Error(`createPurchaseOrder: ${error.message}`);
  return data!.id as string;
}

export async function updatePurchaseOrder(id: string, patch: { supplier_id?: string | null; status?: PoStatus; expected_at?: string | null }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("purchase_orders")
    .update({ supplier_id: patch.supplier_id, status: patch.status, expected_at: patch.expected_at })
    .eq("id", id);
  if (error) throw new Error(`updatePurchaseOrder: ${error.message}`);
}

export async function addPoItem(po_id: string, item: { part_id: string; qty: number; unit_cost?: number | null }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("po_items")
    .insert({ po_id, part_id: item.part_id, qty: item.qty, unit_cost: item.unit_cost ?? null, received_qty: 0 })
    .select("id")
    .single();
  if (error) throw new Error(`addPoItem: ${error.message}`);
  return data!.id as string;
}

export async function receivePoItem(po_id: string, item_id: string, qty: number) {
  const supabase = await createSupabaseServerClient();
  const { data: it, error } = await supabase.from("po_items").select("part_id,received_qty,qty").eq("id", item_id).single();
  if (error) throw new Error(`receivePoItem: ${error.message}`);
  const newReceived = Math.min((it?.received_qty ?? 0) + qty, it?.qty ?? qty);
  const { error: e2 } = await supabase.from("po_items").update({ received_qty: newReceived }).eq("id", item_id);
  if (e2) throw new Error(`receivePoItem update: ${e2.message}`);
  // Movement IN
  await createMovement({ part_id: it!.part_id, type: "IN", quantity: qty, note: `PO ${po_id}` });
  // Optionally update PO status
  const { data: left, error: e3 } = await supabase
    .from("po_items")
    .select("qty,received_qty")
    .eq("po_id", po_id);
  if (!e3) {
    const all = (left ?? []);
    const fully = all.length > 0 && all.every((x: any) => Number(x.received_qty ?? 0) >= Number(x.qty ?? 0));
    await updatePurchaseOrder(po_id, { status: fully ? "received" : "partially_received" });
  }
}

