import { getAircraft, getCustomers } from "@/lib/mock";
import { Quote } from "@/store/mockState";
import { computeTotals } from "./quote";

const money = (n: number) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export function buildQuoteHtml(q: Quote) {
  const aircraft = getAircraft();
  const customers = getCustomers();
  const c = customers.find(x => x.id === q.customerId);
  const a = aircraft.find(x => x.id === q.aircraftId);
  const tot = computeTotals(q.items, q.discountPct ?? 0);

  const css = `
  body{font-family:Arial,Helvetica,sans-serif;padding:28px;color:#111}
  h1,h2,h3{margin:0 0 8px 0}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .card{border:1px solid #e5e7eb;border-radius:10px;padding:12px}
  table{width:100%;border-collapse:collapse;margin-top:10px}
  th,td{border:1px solid #e5e7eb;padding:8px;font-size:12px}
  th{background:#f8fafc;text-align:left}
  .right{text-align:right}
  .muted{color:#666}
  .sign{height:90px;border:1px dashed #cbd5e1;border-radius:8px}
  `;

  return `
  <html>
    <head><meta charset="utf-8"/><title>${q.id} - Devis</title><style>${css}</style></head>
    <body>
      <div style="display:flex;justify-content:space-between">
        <div>
          <h1>Devis ${q.id}</h1>
          <div class="muted">Émis le ${new Date(q.createdAt).toLocaleString()}</div>
        </div>
        <div style="text-align:right">
          <strong>GarageFlow Aviation</strong><br/>Aéroport Gustaf III (TFFJ)<br/>
          Saint-Barthélemy 97133<br/>+590 690 00 00 00 — ops@garageflow.sbh
        </div>
      </div>

      <div class="grid" style="margin-top:14px">
        <div class="card">
          <h3>Client</h3>
          <div><strong>${c?.name ?? q.customerId}</strong></div>
          <div class="muted">${c?.email ?? ""} • ${c?.phone ?? ""}</div>
          <div class="muted">${(c?.address ?? "").replace(/\n/g,"<br/>")}</div>
        </div>
        <div class="card">
          <h3>Aéronef</h3>
          <div><strong>${a ? `${a.reg} — ${a.type}` : q.aircraftId}</strong></div>
          <div class="muted">Base: ${a?.base ?? "—"}</div>
        </div>
      </div>

      <h3 style="margin-top:16px">Lignes</h3>
      <table>
        <thead><tr><th>Type</th><th>Désignation</th><th>Qté/Heures</th><th>PU/Taux</th><th class="right">Montant</th></tr></thead>
        <tbody>
          ${q.items.map((it) => {
            if (it.kind === "part") {
              const m = (it.qty ?? 0) * (it.unit ?? 0);
              return `<tr><td>Pièce</td><td>${it.label}</td><td>${it.qty ?? ""}</td><td>${money(it.unit ?? 0)}</td><td class="right">${money(m)}</td></tr>`;
            } else {
              const m = (it.hours ?? 0) * (it.rate ?? 0);
              return `<tr><td>MO</td><td>${it.label}</td><td>${it.hours ?? ""}</td><td>${money(it.rate ?? 0)}</td><td class="right">${money(m)}</td></tr>`;
            }
          }).join("")}
          <tr><td colspan="4" class="right">Sous-total</td><td class="right">${money(tot.parts + tot.labor)}</td></tr>
          <tr><td colspan="4" class="right">Remise</td><td class="right">-${money(tot.discount)}</td></tr>
          <tr><td colspan="4" class="right">Taxes</td><td class="right">${money(tot.taxes)}</td></tr>
          <tr><td colspan="4" class="right"><strong>Total</strong></td><td class="right"><strong>${money(tot.total)}</strong></td></tr>
        </tbody>
      </table>

      <div class="grid" style="margin-top:18px">
        <div class="card">
          <h3>Conditions</h3>
          <div class="muted" style="font-size:12px;line-height:1.5">
            Validité 30 jours. Délais et disponibilités à confirmer à l’acceptation.
            Paiement: ${c?.terms ?? "NET30"}.
          </div>
        </div>
        <div class="card">
          <h3>Signature (acceptation)</h3>
          <div class="sign"></div>
          <div class="muted">Nom, date</div>
        </div>
      </div>

      <script>window.onload = () => window.print();</script>
    </body>
  </html>`;
}

