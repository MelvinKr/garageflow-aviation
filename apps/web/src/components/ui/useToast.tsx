"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: string; title?: string; message: string; type?: "success"|"error"|"info" };
type Ctx = {
  toasts: Toast[];
  push: (t: Omit<Toast,"id">) => void;
  remove: (id: string) => void;
};
const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: string) => setToasts((ts) => ts.filter(t => t.id !== id)), []);
  const push = useCallback((t: Omit<Toast,"id">) => {
    const id = crypto.randomUUID();
    setToasts((ts) => [{ id, ...t }, ...ts]);
    // auto-dismiss after 4s
    setTimeout(() => remove(id), 4000);
  }, [remove]);
  const value = useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);
  return <ToastCtx.Provider value={value}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

