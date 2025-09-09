import parts from "../mock/parts.json";
import aircraft from "../mock/aircraft.json";
import customers from "../mock/customers.json";
import suppliers from "../mock/suppliers.json";
import quotes from "../mock/quotes.json";
import workorders from "../mock/workorders.json";

export type Part = typeof parts[number];
export type Aircraft = typeof aircraft[number];
export type Customer = typeof customers[number];

export function getParts() { return parts; }
export function getAircraft() { return aircraft; }
export function getCustomers() { return customers; }
export function getSuppliers() { return suppliers; }

export function getQuotes() { return quotes as any; }

export function getWorkOrders() { return workorders as any; }

export function getKpis() {
  const lowStock = parts.filter(p => p.qty <= p.minQty).length;
  const totalStockValue = parts.reduce((acc, p) => acc + p.qty * p.unitCost, 0);
  const openWo = (workorders as any[]).filter((w: any) => w.status !== "closed").length;
  const quotesSent = (quotes as any[]).filter((q: any) => q.status !== "draft").length;
  return {
    lowStock,
    totalStockValue: Number(totalStockValue.toFixed(2)),
    openWo,
    quotesSent
  };
}
