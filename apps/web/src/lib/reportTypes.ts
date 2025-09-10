export type StockKPI = {
  partNumber: string;
  name: string;
  onHand: number;
  minStock: number;
  monthlyConsumption: number[];
};

export type QuoteKPI = {
  month: string;
  count: number;
  total: number;
  conversionRate: number;
};

export type WOKPI = {
  month: string;
  opened: number;
  closed: number;
  avgCycleDays: number;
};

