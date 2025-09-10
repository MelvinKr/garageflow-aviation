import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { Repos } from "@/data/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const quotes = await Repos.quotes.list();
  const q = quotes.find((x: any) => x.id === params.id);
  if (!q) return NextResponse.json({ error: "not found" }, { status: 404 });

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  // Header
  doc.fontSize(18).text(`Devis ${q.id}`, { align: "right" });
  doc.moveDown();
  doc.fontSize(12).text(`Client: ${q.customerId ?? "-"}`);
  doc.text(`Appareil: ${q.aircraftId ?? "-"}`);
  doc.text(`Statut: ${q.status ?? "-"}`);
  doc.moveDown();

  // Items (DB list() may not include items yet; render placeholder if empty)
  doc.fontSize(13).text("Détail");
  doc.moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();

  let total = 0;
  const items: any[] = Array.isArray((q as any).items) ? (q as any).items : [];
  if (items.length === 0) {
    doc.fontSize(12).fillColor("#666").text("(Aucune ligne)" ).fillColor("#000");
  }
  for (const it of items) {
    const isLabor = it.kind === "labor";
    const row = isLabor
      ? `MO: ${it.label} — ${it.hours ?? 0}h x ${(it.rate ?? 95).toFixed?.(2) ?? String(it.rate ?? 95)}`
      : `Pièce: ${it.label} — ${it.qty ?? 0} x ${(it.unit ?? 0).toFixed?.(2) ?? String(it.unit ?? 0)}`;
    const line = isLabor
      ? (Number(it.hours ?? 0) * Number(it.rate ?? 95))
      : (Number(it.qty ?? 0) * Number(it.unit ?? 0));
    total += line;
    doc.text(`${row}  →  ${line.toFixed(2)} €`);
  }

  if (q.discountPct) {
    const disc = total * (Number(q.discountPct) / 100);
    doc.moveDown().text(`Remise ${q.discountPct}%: -${disc.toFixed(2)} €`);
    total -= disc;
  }
  doc.moveDown().fontSize(14).text(`TOTAL: ${total.toFixed(2)} €`, { align: "right" });
  doc.end();

  const pdf = await done;
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="quote-${q.id}.pdf"`,
      // Allow caching in browser
      "Cache-Control": "private, max-age=60",
    },
  });
}

