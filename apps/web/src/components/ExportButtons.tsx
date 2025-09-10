"use client";

import React from "react";
import type { StockKPI, QuoteKPI, WOKPI } from "@/lib/reportTypes";

export function ExportButtons({
  stock,
  quotes,
  wo,
}: {
  stock: (StockKPI & { lastEMA?: number })[];
  quotes: QuoteKPI[];
  wo: WOKPI[];
}) {
  async function exportXLSX() {
    const XLSX = await import("xlsx");

    const wb = XLSX.utils.book_new();

    const stockRows = stock.map((s) => ({
      partNumber: s.partNumber,
      name: s.name,
      onHand: s.onHand,
      minStock: s.minStock,
      lastEMA: (s as any).lastEMA ?? "",
    }));
    const wsStock = XLSX.utils.json_to_sheet(stockRows);
    XLSX.utils.book_append_sheet(wb, wsStock, "Stock");

    const wsQ = XLSX.utils.json_to_sheet(quotes);
    XLSX.utils.book_append_sheet(wb, wsQ, "Quotes");

    const wsWO = XLSX.utils.json_to_sheet(wo);
    XLSX.utils.book_append_sheet(wb, wsWO, "WorkOrders");

    XLSX.writeFile(wb, `reports_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function exportPDF() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    const margin = 36;
    let y = margin;

    doc.setFontSize(16);
    doc.text("GarageFlow – Rapports synthèse", margin, y);
    y += 18;
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleString()}`, margin, y);
    y += 20;

    // Stock summary
    doc.setFontSize(12);
    doc.text("Stock (top 10)", margin, y);
    y += 14;
    doc.setFontSize(9);
    stock.slice(0, 10).forEach((s) => {
      doc.text(
        `• ${s.partNumber} – ${s.name} | OnHand ${s.onHand} | Min ${s.minStock} | EMA ${(s as any).lastEMA ?? "-"}`,
        margin,
        y
      );
      y += 12;
    });

    // Quotes summary
    y += 8;
    doc.setFontSize(12);
    doc.text("Devis (12 mois)", margin, y);
    y += 14;
    doc.setFontSize(9);
    const totalQ = quotes.reduce((acc, q) => acc + q.total, 0);
    const avgConv = quotes.length ? quotes.reduce((a, q) => a + q.conversionRate, 0) / quotes.length : 0;
    doc.text(`Total montant ~ ${Math.round(totalQ)} | taux conv. moyen ${(avgConv * 100).toFixed(1)}%`, margin, y);
    y += 14;

    // WO summary
    doc.setFontSize(12);
    doc.text("Work Orders (12 mois)", margin, y);
    y += 14;
    doc.setFontSize(9);
    const sumO = wo.reduce((a, r) => a + r.opened, 0);
    const sumC = wo.reduce((a, r) => a + r.closed, 0);
    const avgCycle = wo.length ? wo.reduce((a, r) => a + r.avgCycleDays, 0) / wo.length : 0;
    doc.text(`Ouverts ${sumO} | Fermés ${sumC} | Cycle moyen ${avgCycle.toFixed(1)} j`, margin, y);

    doc.save(`reports_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50" onClick={exportXLSX}>
        Export XLSX
      </button>
      <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50" onClick={exportPDF}>
        Export PDF
      </button>
    </div>
  );
}

