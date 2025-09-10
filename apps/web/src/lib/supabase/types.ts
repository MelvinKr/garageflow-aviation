// apps/web/src/lib/supabase/types.ts

export type UUID = string;

export type MovementType =
  | "IN"
  | "OUT"
  | "RESERVE"
  | "UNRESERVE"
  | "CONSUME"; // legacy name used in some reports

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

export interface Part {
  id: string;
  part_number: string;
  name: string;
  on_hand: number | null;
  min_stock: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Movement {
  id: string;
  part_id: string;
  type: MovementType;
  quantity: number;
  note?: string | null;
  created_at?: string | null;
}

export interface Quote {
  id: string;
  status: QuoteStatus;
  total_amount: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WorkOrder {
  id: string;
  created_at?: string | null;
  closed_at?: string | null;
}

export interface Profile {
  id: UUID; // maps to auth.users.id
  role: string | null;
  full_name: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

