"use client";

import { create } from "zustand";
import partsData from "@/mock/parts.json";

export type Part = typeof partsData[number];

export type Movement = {
  id: string;
  partId: string;
  type: "IN" | "OUT";
  qty: number;
  reason?: string;
  date: string; // ISO
};

type State = {
  parts: Part[];
  movements: Movement[];
  updatePart: (id: string, patch: Partial<Part>) => void;
  addMovement: (m: { partId: string; type: "IN" | "OUT"; qty: number; reason?: string }) => void;
};

export const useMockState = create<State>((set, get) => ({
  parts: partsData as Part[],
  movements: [],
  updatePart: (id, patch) =>
    set((s) => ({
      parts: s.parts.map((p) => (p.id === id ? ({ ...p, ...patch } as Part) : p)),
    })),
  addMovement: ({ partId, type, qty, reason }) => {
    const safeQty = Math.max(0, Number(qty) || 0);
    const today = new Date();
    const dayKey = today.toISOString().slice(0, 10).replace(/-/g, "");
    const countForDay = get()
      .movements.filter((m) => m.id.startsWith(`M-${dayKey}-`)).length;
    const id = `M-${dayKey}-${String(countForDay + 1).padStart(3, "0")}`;
    const delta = type === "IN" ? safeQty : -safeQty;

    set((s) => ({
      movements: [
        { id, partId, type, qty: safeQty, reason, date: today.toISOString() },
        ...s.movements,
      ],
      parts: s.parts.map((p) =>
        p.id === partId
          ? ({
              ...p,
              qty: Math.max(0, Number(p.qty ?? 0) + delta),
            } as Part)
          : p
      ),
    }));
  },
}));

// Helper: simulation d’upload (mock) -> renvoie une URL locale base64
export async function mockUpload(file: File): Promise<string> {
  // Use FileReader to produce a data URL (works in browser without Node Buffer)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
  return dataUrl;
}
