import type { WorkOrder } from "@/store/mockState";
import { getAircraft, getParts } from "@/lib/mock";

export function buildWorkOrderHtml(wo: WorkOrder) {
  const parts = getParts();
  const aircraft = getAircraft();
  const a = aircraft.find((x) => x.id === wo.aircraftId);
  const tasksRows = wo.tasks.map((t) => {
    const p = t.partId ? parts.find((x) => x.id === t.partId) : null;
    const part = p ? `${p.sku} — ${p.name}` : "";
    return `<tr><td>${t.done ? "✔" : ""}</td><td>${t.label}</td><td>${part}</td><td>${t.qty ?? ""}</td></tr>`;
  }).join("");

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>WO ${wo.id}</title>
      <style>
        body{font-family:Arial, sans-serif; padding:24px;}
        h1{margin:0 0 8px 0}
        table{width:100%; border-collapse:collapse; margin-top:12px}
        th,td{border:1px solid #ddd; padding:8px; font-size:12px}
        th{background:#f6f6f6; text-align:left}
      </style>
    </head>
    <body>
      <h1>Work Order ${wo.id}</h1>
      <div>Avion: <b>${a ? `${a.reg} — ${a.type}` : wo.aircraftId}</b></div>
      <div>Ouvert le: ${new Date(wo.openedAt).toLocaleString()}</div>
      ${wo.closedAt ? `<div>Clos le: ${new Date(wo.closedAt).toLocaleString()}</div>` : ""}
      <table>
        <thead><tr><th>Fait</th><th>Tâche</th><th>Pièce</th><th>Qté</th></tr></thead>
        <tbody>${tasksRows}</tbody>
      </table>
      <script>window.onload = () => window.print()</script>
    </body>
  </html>`;
  return html;
}

