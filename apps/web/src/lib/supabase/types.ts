// apps/web/src/lib/supabase/types.ts

export type UUID = string;

// App-level movement types.
// DB enum uses: 'RECEIVE', 'CONSUME', 'ADJUST'. We map IN→RECEIVE, OUT→CONSUME.
export type MovementType =
  | "IN"
  | "OUT"
  | "RECEIVE"
  | "CONSUME"
  | "ADJUST"
  | "RESERVE" // optional app concept (not a DB enum)
  | "UNRESERVE"; // optional app concept (not a DB enum)

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

export interface Part {
  id: number; // DB identity integer
  part_number: string;
  name: string;
  on_hand: number | null;
  min_stock: number | null;
  default_unit_cost?: number | null;
  default_unit_price?: number | null;
  tax_rate_pct?: number | null;
  margin_target_pct?: number | null;
  currency?: string | null; // e.g. 'CAD'
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Movement {
  id: number;
  part_id: number;
  type: MovementType;
  quantity: number;
  note?: string | null;
  created_at?: string | null;
}

export interface Quote {
  id: number;
  status: QuoteStatus;
  total_amount: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WorkOrder {
  id: number;
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
