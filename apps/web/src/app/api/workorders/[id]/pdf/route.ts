import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { Repos } from "@/data/server";
import { getAircraft, getCustomers } from "@/lib/mock";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const wo = await Repos.workorders.get(params.id);
  if (!wo) return NextResponse.json({ error: "not found" }, { status: 404 });

  const parts = await Repos.parts.list();
  const partMap = new Map(parts.map((p: any) => [p.id, p]));

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  // Header
  const ac = getAircraft().find((a: any) => a.id === wo.aircraftId);
  const cust = ac ? getCustomers().find((c: any) => c.id === ac.ownerId) : undefined;
  doc.fontSize(18).text(`Work Order ${wo.id}`, { align: "right" });
  doc.moveDown();
  doc.fontSize(12).text(`Client: ${cust?.name ?? "—"}`);
  doc.text(`Appareil: ${ac?.reg ?? wo.aircraftId} (${ac?.type ?? "—"})`);
  doc.text(`Statut: ${wo.status}`);
  doc.text(`Ouvert le: ${new Date(wo.openedAt).toLocaleString()}`);
  if (wo.closedAt) doc.text(`Clôturé le: ${new Date(wo.closedAt).toLocaleString()}`);
  doc.moveDown();

  // Details
  doc.fontSize(13).text("Détail des tâches");
  doc.moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();

  let partsTotal = 0;
  let laborTotal = 0;

  for (const t of wo.tasks) {
    const p = t.partId ? partMap.get(t.partId) : null;
    const qty = Number(t.qty ?? 0);
    const hours = Number(t.hours ?? 0);
    const rate = Number(t.rate ?? 95);

    if (p && qty > 0) {
      const unit = Number(p.unitCost ?? 0);
      const line = qty * unit;
      partsTotal += line;
      doc.fontSize(12).text(`Pièce: ${p.sku} — ${p.name} — ${qty} x ${unit.toFixed(2)} → ${line.toFixed(2)} €`);
    } else if (t.partId && qty > 0) {
      // Unknown part in DB
      doc.fontSize(12).fillColor("#666").text(`Pièce: ${t.partId} — ${qty} x ?`).fillColor("#000");
    }

    if (hours > 0) {
      const line = hours * rate;
      laborTotal += line;
      doc.fontSize(12).text(`MO: ${t.label} — ${hours.toFixed(2)}h x ${rate.toFixed(2)} → ${line.toFixed(2)} €`);
    }
  }

  const total = partsTotal + laborTotal;
  doc.moveDown();
  doc.fontSize(12).text(`Sous-total pièces: ${partsTotal.toFixed(2)} €`);
  doc.fontSize(12).text(`Main d'œuvre: ${laborTotal.toFixed(2)} €`);
  doc.moveDown().fontSize(14).text(`TOTAL: ${total.toFixed(2)} €`, { align: "right" });
  doc.end();

  const pdf = await done;
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="wo-${wo.id}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
