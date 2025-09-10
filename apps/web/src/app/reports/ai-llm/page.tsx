"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AIReportLLMPage() {
  const sp = useSearchParams();
  const months = sp.get("months") ?? "12";
  const alpha = sp.get("alpha") ?? "0.5";

  const [md, setMd] = useState<string>("");
  const [model, setModel] = useState<string>("");

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/reports/ai/llm?months=${months}&alpha=${alpha}`, { signal: ac.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setMd(j.markdown);
        setModel(j.model);
      });
    return () => ac.abort();
  }, [months, alpha]);

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const lines = md.replace(/\r/g, "").split("\n");
    let y = 40;
    doc.setFontSize(14);
    doc.text(`Rapport IA (LLM: ${model}) — ${months}m  α=${alpha}`, 40, y);
    y += 24;
    doc.setFontSize(11);
    for (const line of lines) {
      const chunks = (doc as any).splitTextToSize(line, 515);
      doc.text(chunks as any, 40, y);
      y += 16 + ((chunks as any).length - 1) * 12;
      if (y > 770) {
        doc.addPage();
        y = 40;
      }
    }
    doc.save(`ai_llm_report_${months}m.pdf`);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rapport IA (LLM)</h1>
        <div className="flex gap-2">
          <button onClick={() => location.reload()} className="px-3 py-2 rounded border">
            Régénérer
          </button>
          <button onClick={exportPDF} className="px-3 py-2 rounded border">
            Exporter PDF
          </button>
        </div>
      </div>
      <pre className="p-4 bg-white border rounded whitespace-pre-wrap text-sm leading-6">{md || "Génération en cours..."}</pre>
    </div>
  );
}

