"use client";

import { create } from "zustand";
import partsData from "@/mock/parts.json";

export type Part = typeof partsData[number];

type State = {
  parts: Part[];
  updatePart: (id: string, patch: Partial<Part>) => void;
};

export const useMockState = create<State>((set) => ({
  parts: partsData as Part[],
  updatePart: (id, patch) =>
    set((s) => ({
      parts: s.parts.map((p) => (p.id === id ? ({ ...p, ...patch } as Part) : p)),
    })),
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

