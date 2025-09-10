"use client";
import { useCallback } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export default function ExportButtons() {
  const doExportXLSX = useCallback(async () => {
    const sp = new URLSearchParams(window.location.search);
    const months = sp.get("months") ?? "12";
    const alpha = sp.get("alpha") ?? "0.5";

    const [stock, quotes, wo] = await Promise.all([
      fetch(`/api/reports/stock?months=${months}&alpha=${alpha}`).then((r) => r.json()),
      fetch(`/api/reports/quotes?months=${months}`).then((r) => r.json()),
      fetch(`/api/reports/wo?months=${months}`).then((r) => r.json()),
    ]);

    const wb = XLSX.utils.book_new();

    // Normalize stock
    const stockParts = stock.parts ?? (stock.rows ?? []).map((r: any) => ({
      partNumber: r.partNumber ?? r.sku,
      name: r.name,
      onHand: r.onHand ?? r.qty,
      minStock: r.minStock ?? r.min_qty,
      ema: r.ema ?? r.emaSeries ?? [],
      target: r.target ?? null,
      reorder: r.reorder ?? null,
    }));
    const stockRows = stockParts.map((p: any) => ({
      partNumber: p.partNumber,
      name: p.name,
      onHand: p.onHand,
      target: p.target ?? "",
      reorder: p.reorder ? "YES" : "NO",
      lastEMA: p.ema?.[p.ema.length - 1] ?? 0,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockRows), "Stock");

    const quotesItems = quotes.items ?? quotes;
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(quotesItems), "Quotes");

    const woItems = wo.items ?? wo;
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(woItems), "WorkOrders");

    const fname = `reports_${months}m.xlsx`;
    XLSX.writeFile(wb, fname);
  }, []);

  const doExportPDF = useCallback(async () => {
    const sp = new URLSearchParams(window.location.search);
    const months = sp.get("months") ?? "12";
    const alpha = sp.get("alpha") ?? "0.5";

    const [stock, quotes, wo] = await Promise.all([
      fetch(`/api/reports/stock?months=${months}&alpha=${alpha}`).then((r) => r.json()),
      fetch(`/api/reports/quotes?months=${months}`).then((r) => r.json()),
      fetch(`/api/reports/wo?months=${months}`).then((r) => r.json()),
    ]);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    const H = (t: string) => {
      doc.setFontSize(16);
      doc.text(t, 40, y);
      y += 20;
    };
    const P = (t: string) => {
      doc.setFontSize(11);
      doc.text(t, 40, y);
      y += 16;
    };

    H(`Rapports & Prévisions (${months} mois)`);
    P(`EMA alpha = ${alpha}`);

    // Stock summary
    const stockParts = stock.parts ?? (stock.rows ?? []).map((r: any) => ({
      partNumber: r.partNumber ?? r.sku,
      name: r.name,
      onHand: r.onHand ?? r.qty,
      minStock: r.minStock ?? r.min_qty,
      ema: r.ema ?? r.emaSeries ?? [],
      target: r.target ?? null,
      reorder: r.reorder ?? null,
    }));
    const need = (stockParts as any[]).filter((p) => p.reorder);
    H("Stock — Réassort suggéré");
    if (!need.length) P("Rien à commander ✅");
    else need.slice(0, 12).forEach((p: any) => {
      P(`${p.partNumber} — stock ${p.onHand} / cible ${p.target} (EMA≈${p.ema.at(-1) ?? 0})`);
    });

    // Quotes summary
    const qItems = quotes.items ?? quotes;
    const totalQuotes = (qItems as any[]).reduce((s, x: any) => s + Number(x.total ?? 0), 0);
    const avgConv = (qItems as any[]).length
      ? (qItems as any[]).reduce((s, x: any) => s + Number(x.conversion ?? x.conversionRate ?? 0), 0) /
        (qItems as any[]).length
      : 0;
    H("Devis — Synthèse");
    P(`Montant cumulé: ${totalQuotes.toFixed(2)} • Taux conv. moyen: ${(avgConv * 100).toFixed(1)}%`);

    // WO summary
    const woItems = wo.items ?? wo;
    const avgCycle = (woItems as any[]).length
      ? (woItems as any[]).reduce((s, x: any) => s + Number(x.avgCycleDays ?? 0), 0) / (woItems as any[]).length
      : 0;
    H("Work Orders — Synthèse");
    P(`Cycle moyen: ${avgCycle.toFixed(1)} j`);

    doc.save(`reports_${months}m.pdf`);
  }, []);

  return (
    <div className="flex gap-2">
      <button onClick={doExportXLSX} className="px-3 py-2 rounded border">
        Export XLSX
      </button>
      <button onClick={doExportPDF} className="px-3 py-2 rounded border">
        Export PDF
      </button>
      <button
        onClick={() => {
          const sp = new URLSearchParams(window.location.search);
          const months = sp.get("months") ?? "12";
          const alpha = sp.get("alpha") ?? "0.5";
          window.location.href = `/api/reports/export/csv?months=${months}&alpha=${alpha}`;
        }}
        className="px-3 py-2 rounded border"
      >
        Export CSV
      </button>
    </div>
  );
}
