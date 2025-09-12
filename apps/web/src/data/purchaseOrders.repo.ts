// apps/web/src/data/purchaseOrders.repo.ts
import { sbAdmin, createSupabaseServerClient } from "@/lib/supabase/server";
import { createMovement } from "./movements.repo";

export type PoStatus = "Draft" | "Ordered" | "Partially_Received" | "Received" | "Cancelled";

export async function listPurchaseOrders(opts?: { limit?: number; offset?: number }) {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const from = opts?.offset ?? 0;
  let { data, error } = await supabase
    .from("purchase_orders")
    .select("id,supplier_id,status,order_date,expected_date,created_at")
    .range(from, from + limit - 1)
    .order("order_date", { ascending: false });
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data, error } = await admin
      .from("purchase_orders")
      .select("id,supplier_id,status,order_date,expected_date,created_at")
      .range(from, from + limit - 1)
      .order("order_date", { ascending: false }));
  }
  if (error) throw new Error(`listPurchaseOrders: ${error.message}`);
  return data ?? [];
}

export async function getPurchaseOrder(id: string | number) {
  const supabase = await createSupabaseServerClient();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  let { data: po, error } = await supabase
    .from("purchase_orders")
    .select("id,supplier_id,status,order_date,expected_date,created_at")
    .eq("id", key as any)
    .single();
  if (error && /permission denied/i.test(error.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data: po, error } = await admin
      .from("purchase_orders")
      .select("id,supplier_id,status,order_date,expected_date,created_at")
      .eq("id", key as any)
      .single());
  }
  if (error) throw new Error(`getPurchaseOrder: ${error.message}`);
  let { data: items, error: e2 } = await supabase
    .from("purchase_order_items")
    .select("id,part_id,quantity_ordered,quantity_received,unit_price,created_at")
    .eq("purchase_order_id", key as any)
    .order("created_at", { ascending: false });
  if (e2 && /permission denied/i.test(e2.message) && process.env.SUPABASE_SERVICE_ROLE) {
    const admin = sbAdmin();
    ({ data: items, error: e2 } = await admin
      .from("purchase_order_items")
      .select("id,part_id,quantity_ordered,quantity_received,unit_price,created_at")
      .eq("purchase_order_id", key as any)
      .order("created_at", { ascending: false }));
  }
  if (e2) throw new Error(`getPurchaseOrder items: ${e2.message}`);
  return { ...po, items: items ?? [] } as any;
}

export async function createPurchaseOrder(input?: { supplier_id?: number | null; expected_date?: string | null }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("purchase_orders")
    .insert({ supplier_id: input?.supplier_id ?? null, expected_date: input?.expected_date ?? null, status: "Draft" })
    .select("id")
    .single();
  if (error) throw new Error(`createPurchaseOrder: ${error.message}`);
  return data!.id as string;
}

export async function updatePurchaseOrder(id: string | number, patch: { supplier_id?: number | null; status?: PoStatus; expected_date?: string | null }) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase
    .from("purchase_orders")
    .update({ supplier_id: patch.supplier_id, status: patch.status, expected_date: patch.expected_date })
    .eq("id", key as any);
  if (error) throw new Error(`updatePurchaseOrder: ${error.message}`);
}

export async function addPoItem(purchase_order_id: string | number, item: { part_id: number; quantity_ordered: number; unit_price?: number | null }) {
  const supabase = sbAdmin();
  const key = typeof purchase_order_id === "string" && /^\d+$/.test(purchase_order_id) ? Number(purchase_order_id) : purchase_order_id;
  const { data, error } = await supabase
    .from("purchase_order_items")
    .insert({ purchase_order_id: key as any, part_id: item.part_id, quantity_ordered: item.quantity_ordered, unit_price: item.unit_price ?? 0, quantity_received: 0 })
    .select("id")
    .single();
  if (error) throw new Error(`addPoItem: ${error.message}`);
  return data!.id as string;
}

export async function receivePoItem(purchase_order_id: string | number, item_id: string | number, qty: number) {
  const supabase = sbAdmin();
  const keyPo = typeof purchase_order_id === "string" && /^\d+$/.test(purchase_order_id) ? Number(purchase_order_id) : purchase_order_id;
  const keyItem = typeof item_id === "string" && /^\d+$/.test(item_id) ? Number(item_id) : item_id;
  const { data: it, error } = await supabase
    .from("purchase_order_items")
    .select("part_id,quantity_received,quantity_ordered")
    .eq("id", keyItem as any)
    .single();
  if (error) throw new Error(`receivePoItem: ${error.message}`);
  const newReceived = Math.min((it?.quantity_received ?? 0) + qty, it?.quantity_ordered ?? qty);
  const { error: e2 } = await supabase
    .from("purchase_order_items")
    .update({ quantity_received: newReceived })
    .eq("id", keyItem as any);
  if (e2) throw new Error(`receivePoItem update: ${e2.message}`);
  // Movement IN
  await createMovement({ part_id: it!.part_id as any, type: "IN" as any, quantity: qty, note: `PO ${keyPo}` });
  // Optionally update PO status
  const { data: left, error: e3 } = await supabase
    .from("purchase_order_items")
    .select("quantity_ordered,quantity_received")
    .eq("purchase_order_id", keyPo as any);
  if (!e3) {
    const all = (left ?? []);
    const fully = all.length > 0 && all.every((x: any) => Number(x.quantity_received ?? 0) >= Number(x.quantity_ordered ?? 0));
    await updatePurchaseOrder(purchase_order_id, { status: fully ? "Received" : "Partially_Received" });
  }
}
