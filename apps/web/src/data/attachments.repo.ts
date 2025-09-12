// apps/web/src/data/attachments.repo.ts
import { sbAdmin } from "@/lib/supabase/server";

export type AttachmentEntity = "part" | "movement" | "quote" | "work_order" | "purchase_order";

export interface AttachmentRow {
  id: number;
  entity_type: AttachmentEntity;
  entity_id: number;
  url: string;
  mime_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function listAttachments(entity: AttachmentEntity, entity_id: number) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("attachments")
    .select("id,entity_type,entity_id,url,mime_type,created_at,updated_at")
    .eq("entity_type", entity)
    .eq("entity_id", entity_id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listAttachments: ${error.message}`);
  return (data ?? []) as AttachmentRow[];
}

export async function addAttachment(input: { entity_type: AttachmentEntity; entity_id: number; url: string; mime_type?: string | null }) {
  const supabase = sbAdmin();
  const { data, error } = await supabase
    .from("attachments")
    .insert({ entity_type: input.entity_type, entity_id: input.entity_id, url: input.url, mime_type: input.mime_type ?? null })
    .select("id")
    .single();
  if (error) throw new Error(`addAttachment: ${error.message}`);
  return data!.id as number;
}

export async function deleteAttachment(id: string | number) {
  const supabase = sbAdmin();
  const key = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  const { error } = await supabase.from("attachments").delete().eq("id", key as any);
  if (error) throw new Error(`deleteAttachment: ${error.message}`);
}
