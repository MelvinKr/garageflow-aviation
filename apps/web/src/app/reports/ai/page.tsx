"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";

export default function AIReportPage() {
  const sp = useSearchParams();
  const months = sp.get("months") ?? "12";
  const alpha = sp.get("alpha") ?? "0.5";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetch(`/api/reports/ai/insights?months=${months}&alpha=${alpha}`, { signal: ac.signal, cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [months, alpha]);

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    const L = (t: string, s = 12) => {
      doc.setFontSize(s);
      t.split("\n").forEach((line) => {
        doc.text(line, 40, y);
        y += 16;
      });
    };
    L(`Rapport IA — ${months}m  (α=${alpha})`, 16);
    y += 4;
    L(data.report);
    doc.save(`ai_report_${months}m.pdf`);
  };

  if (loading) return <p className="p-6">Analyse en cours…</p>;
  if (!data) return <p className="p-6">Aucune donnée.</p>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rapport IA</h1>
        <button onClick={exportPDF} className="px-3 py-2 rounded border">
          Exporter PDF
        </button>
      </div>

      <pre className="p-4 bg-white border rounded whitespace-pre-wrap text-sm leading-6">{data.report}</pre>

      {data.risky?.length ? (
        <div className="rounded border bg-white">
          <div className="p-3 text-sm font-medium">Pièces à risque</div>
          <div className="divide-y">
            {data.risky.map((p: any) => (
              <div key={p.partNumber} className="p-3 text-sm flex gap-3">
                <div className="w-40 font-mono">{p.partNumber}</div>
                <div className="flex-1 truncate">{p.name}</div>
                <div>
                  stock {p.onHand} / cible {p.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

