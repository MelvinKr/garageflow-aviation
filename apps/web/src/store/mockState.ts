"use client";

import { create } from "zustand";
import partsData from "@/mock/parts.json";

// Types
export type Part = typeof partsData[number];

export type StockMoveType = "IN" | "OUT" | "RESERVE" | "UNRESERVE";
export type StockMove = {
  id: string;
  partId: string;
  type: StockMoveType;
  qty: number;
  reason?: string;
  note?: string;
  by?: string;
  at: string; // ISO date
  ref?: string; // ex: WO-123 / Q-2025-001
};

export type Quote = {
  id: string;
  customerId: string;
  aircraftId: string;
  status: "draft" | "sent" | "accepted";
  discountPct?: number;
  items: {
    id: string;
    kind: "part" | "labor";
    label: string;
    partId?: string;
    qty?: number;
    unit?: number;
    hours?: number;
    rate?: number;
  }[];
  createdAt: string;
};

type State = {
  parts: Part[];
  movements: StockMove[];
  quotes: Quote[];
  updatePart: (id: string, patch: Partial<Part>) => void;
  addMovement: (m: Omit<StockMove, "id" | "at"> & { at?: string }) => void;
  addQuote: (q: Omit<Quote, "id" | "createdAt" | "status"> & Partial<Pick<Quote, "status">>) => string;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  removeQuote: (id: string) => void;
  acceptQuote: (id: string) => void;
};

function genId(prefix = "M"): string {
  const d = new Date();
  const iso = d.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${iso}-${rnd}`;
}

export const useMockState = create<State>((set) => ({
  parts: partsData as Part[],
  movements: [],
  quotes: [],

  updatePart: (id, patch) =>
    set((s) => ({
      parts: s.parts.map((p) => (p.id === id ? ({ ...p, ...patch } as Part) : p)),
    })),

  addMovement: (m) =>
    set((s) => {
      const id = genId("M");
      const at = m.at ?? new Date().toISOString();
      const move: StockMove = { id, at, ...m } as StockMove;
      const parts = s.parts.map((p) => {
        if (p.id !== m.partId) return p;
        const qty = Number(p.qty ?? 0);
        const reserved = Number(p.reservedQty ?? 0);
        if (m.type === "IN") return { ...p, qty: qty + m.qty } as Part;
        if (m.type === "OUT") return { ...p, qty: Math.max(0, qty - m.qty) } as Part;
        if (m.type === "RESERVE") return { ...p, reservedQty: reserved + m.qty } as Part;
        if (m.type === "UNRESERVE") return { ...p, reservedQty: Math.max(0, reserved - m.qty) } as Part;
        return p;
      });
      return { parts, movements: [move, ...s.movements] };
    }),

  addQuote: (q) => {
    const id = genId("Q");
    const createdAt = new Date().toISOString();
    const status: Quote["status"] = q.status ?? "draft";
    set((s) => ({ quotes: [{ id, createdAt, status, ...q } as Quote, ...s.quotes] }));
    return id;
  },
  updateQuote: (id, patch) => set((s) => ({ quotes: s.quotes.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeQuote: (id) => set((s) => ({ quotes: s.quotes.filter((x) => x.id !== id) })),
  acceptQuote: (id) => set((s) => ({ quotes: s.quotes.map((x) => (x.id === id ? { ...x, status: "accepted" } : x)) })),
}));

// Mock upload image -> DataURL base64
export async function mockUpload(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(buf).toString("base64")
      : btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `data:${file.type};base64,${base64}`;
}

