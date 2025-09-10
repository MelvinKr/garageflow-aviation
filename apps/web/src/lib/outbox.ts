"use client";
import { useEffect } from "react";
import { useMockState } from "@/store/mockState";

export function useOutboxReplay() {
  const { outbox, dequeue } = useMockState();
  useEffect(() => {
    async function replay() {
      for (const item of [...outbox].reverse()) {
        try {
          if (item.type === "MOVEMENT") {
            await fetch(`/api/parts/${item.payload.partId}/movement`, {
              method: "POST",
              body: JSON.stringify(item.payload),
              headers: { "Content-Type": "application/json" },
            });
          }
          if (item.type === "ACCEPT_QUOTE") {
            await fetch(`/api/quotes/${item.payload.quoteId}/accept`, { method: "POST" });
          }
          if (item.type === "TOGGLE_TASK") {
            const { woId, taskId } = item.payload;
            await fetch(`/api/workorders/${woId}/tasks/${taskId}/toggle`, { method: "POST" });
          }
          dequeue(item.id);
        } catch {
          return;
        }
      }
    }
    function go() {
      if (typeof navigator !== "undefined" && navigator.onLine) replay();
    }
    window.addEventListener("online", go);
    go();
    return () => window.removeEventListener("online", go);
  }, [outbox, dequeue]);
}

