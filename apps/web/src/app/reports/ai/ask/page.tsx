"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function AskIARagPage() {
  const sp = useSearchParams();
  const months = useMemo(() => sp.get("months") ?? "12", [sp]);
  const alpha = useMemo(() => sp.get("alpha") ?? "0.5", [sp]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Bonjour 👋 Posez votre question sur vos données (stock, devis, WO)." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSend(e?: React.FormEvent) {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/ai/ask?months=${months}&alpha=${alpha}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) }
      );
      const data = await res.json();
      const answer = (data?.answer as string) || data?.markdown || data?.text || data?.error || "(pas de réponse)";
      setMessages((m) => [...m, { role: "assistant", content: String(answer) }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Erreur: ${err?.message || String(err)}` }]);
    } finally {
      setLoading(false);
    }
  }

  // Optional: send on Enter
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !loading) {
        void onSend();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, messages, input, months, alpha]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ask IA (RAG)</h1>
        <div className="text-xs text-gray-500">Contexte: {months} mois • α={alpha}</div>
      </div>

      <div className="border rounded bg-white p-4 h-[60vh] overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block max-w-[85%] whitespace-pre-wrap rounded px-3 py-2 text-sm ${
              m.role === "user" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-200"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre question…"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button disabled={loading} className="px-3 py-2 border rounded text-sm hover:bg-gray-50">
          {loading ? "…" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}

