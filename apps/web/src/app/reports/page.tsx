"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ManagerOnly from "@/components/ManagerOnly";
import { ExportButtons } from "@/components/ExportButtons";
import { computeEMA, restockSuggestion } from "@/lib/ema";
import type { StockKPI, QuoteKPI, WOKPI } from "@/lib/reportTypes";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function getStockKPI(): Promise<StockKPI[]> {
  try {
    return await fetchJSON<StockKPI[]>("/api/reports/stock");
  } catch {
    const months = Array.from({ length: 12 }).map((_, i) => i);
    return [
      { partNumber: "OIL-FILT-3200", name: "Oil Filter 3200", onHand: 14, minStock: 10, monthlyConsumption: months.map((i) => 6 + ((i * 3) % 4)) },
      { partNumber: "SPARK-PLUG-A1", name: "Spark Plug A1", onHand: 40, minStock: 25, monthlyConsumption: months.map((i) => 8 + ((i * 5) % 6)) },
      { partNumber: "HYD-HOSE-8mm", name: "Hydraulic Hose 8mm", onHand: 5, minStock: 12, monthlyConsumption: months.map((i) => 4 + (i % 3)) },
      { partNumber: "BRAKE-PAD-L", name: "Brake Pad Large", onHand: 22, minStock: 15, monthlyConsumption: months.map((i) => 10 + ((i * 2) % 5)) },
      { partNumber: "SEAL-PAINT-1L", name: "Seal Paint 1L", onHand: 9, minStock: 8, monthlyConsumption: months.map((i) => 3 + (i % 2)) },
    ];
  }
}

async function getQuoteKPI(): Promise<QuoteKPI[]> {
  try {
    return await fetchJSON<QuoteKPI[]>("/api/reports/quotes");
  } catch {
    return Array.from({ length: 12 }).map((_, i) => ({
      month: `2025-${String(i + 1).padStart(2, "0")}`,
      count: 8 + (i % 4),
      total: 12000 + i * 800,
      conversionRate: 0.45 + (i % 5) / 100,
    }));
  }
}

async function getWOKPI(): Promise<WOKPI[]> {
  try {
    return await fetchJSON<WOKPI[]>("/api/reports/wo");
  } catch {
    return Array.from({ length: 12 }).map((_, i) => ({
      month: `2025-${String(i + 1).padStart(2, "0")}`,
      opened: 5 + (i % 3),
      closed: 4 + ((i + 1) % 4),
      avgCycleDays: 6 + (i % 5),
    }));
  }
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"stock" | "quotes" | "wo">("stock");
  const [stock, setStock] = useState<StockKPI[] | null>(null);
  const [quotes, setQuotes] = useState<QuoteKPI[] | null>(null);
  const [wo, setWo] = useState<WOKPI[] | null>(null);
  const [emaAlpha, setEmaAlpha] = useState<number>(0.35);

  useEffect(() => {
    getStockKPI().then(setStock).catch(console.error);
    getQuoteKPI().then(setQuotes).catch(console.error);
    getWOKPI().then(setWo).catch(console.error);
  }, []);

  const stockWithEMA = useMemo(() => {
    if (!stock) return [];
    return stock.map((p) => {
      const ema = computeEMA(p.monthlyConsumption, emaAlpha);
      const lastEMA = ema.length ? ema[ema.length - 1] : 0;
      const suggestion = restockSuggestion({ onHand: p.onHand, ema: lastEMA, minStock: p.minStock });
      return { ...p, emaSeries: ema, lastEMA, suggestion } as any;
    });
  }, [stock, emaAlpha]);

  return (
    <ManagerOnly>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rapports & Prévisions</h1>
          <ExportButtons stock={stockWithEMA as any} quotes={quotes ?? []} wo={wo ?? []} />
        </div>

        <div>
          <div className="inline-flex rounded border overflow-hidden">
            {(["stock", "quotes", "wo"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveTab(v)}
                className={`px-3 py-1.5 text-sm ${activeTab === v ? "bg-black text-white" : "bg-white"}`}
              >
                {v === "stock" ? "Stock" : v === "quotes" ? "Devis" : "Work Orders"}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "stock" && (
          <div className="space-y-4">
            <div className="border rounded-2xl">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-medium">Prévisions (EMA) & seuils dynamiques</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Alpha EMA</span>
                  <input
                    type="number"
                    step={0.05}
                    min={0.05}
                    max={0.95}
                    value={emaAlpha}
                    onChange={(e) => setEmaAlpha(Number(e.target.value))}
                    className="w-24 border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="p-4 space-y-8">
                {!stockWithEMA.length && <p className="text-gray-500">Chargement…</p>}

                {stockWithEMA.map((p: any) => (
                  <div key={p.partNumber} className="border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-500">{p.partNumber}</div>
                      </div>
                      <div className="text-sm text-right">
                        <div>
                          On-hand: <span className="font-semibold">{p.onHand}</span>
                        </div>
                        <div>
                          Min policy: <span className="font-semibold">{p.minStock}</span>
                        </div>
                        <div>
                          EMA (M+0): <span className="font-semibold">{(p.lastEMA as number).toFixed?.(1) ?? p.lastEMA}</span>
                        </div>
                        {p.suggestion && (
                          <div className="mt-1 inline-flex items-center gap-2 text-amber-700 text-sm">
                            <span className="px-2 py-1 rounded-full bg-amber-100">À commander: {p.suggestion.reorderQty}</span>
                            <span className="text-xs text-gray-500">(cible {p.suggestion.target})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={p.monthlyConsumption.map((v: number, i: number) => ({
                            idx: i + 1,
                            conso: v,
                            ema: (p.emaSeries as number[])?.[i] ?? null,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="idx" tickFormatter={(i: any) => `M${i}`} />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="conso" name="Conso" />
                          <Line type="monotone" dataKey="ema" name="EMA" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "quotes" && (
          <div className="space-y-4">
            <div className="border rounded-2xl">
              <div className="p-4 border-b font-medium">Devis par mois (volume • montant • conversion)</div>
              <div className="p-4">
                {(!quotes || quotes.length === 0) ? (
                  <p className="text-gray-500">Chargement…</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={quotes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" name="# Devis" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={quotes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="total" name="Montant" />
                          <Line type="monotone" dataKey="conversionRate" name="Taux conv." />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "wo" && (
          <div className="space-y-4">
            <div className="border rounded-2xl">
              <div className="p-4 border-b font-medium">Work Orders par mois (ouvert/fermé • cycle moyen)</div>
              <div className="p-4">
                {(!wo || wo.length === 0) ? (
                  <p className="text-gray-500">Chargement…</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={wo}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="opened" name="Ouverts" />
                          <Bar dataKey="closed" name="Fermés" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={wo}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="avgCycleDays" name="Cycle moyen (j)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerOnly>
  );
}

