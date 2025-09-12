-- Reporting views for stock and KPIs

-- v_part_stock: basic per-part stock and valuation
CREATE OR REPLACE VIEW public.v_part_stock AS
SELECT
  p.id,
  p.part_number,
  p.name,
  p.on_hand,
  p.min_stock,
  p.default_unit_cost,
  p.default_unit_price,
  p.currency,
  COALESCE(p.on_hand,0) * COALESCE(p.default_unit_cost,0)::numeric AS stock_value,
  p.updated_at,
  (SELECT MAX(m.created_at) FROM public.movements m WHERE m.part_id = p.id) AS last_movement_at
FROM public.parts p;

-- v_stock_valuation: total stock value
CREATE OR REPLACE VIEW public.v_stock_valuation AS
SELECT
  (SUM(COALESCE(p.on_hand,0) * COALESCE(p.default_unit_cost,0)))::numeric(14,2) AS stock_value
FROM public.parts p;

-- v_daily_movements: activity per day
CREATE OR REPLACE VIEW public.v_daily_movements AS
SELECT
  (date_trunc('day', m.created_at))::date AS day,
  COUNT(*) FILTER (WHERE m.type = 'RECEIVE') AS ins_cnt,
  COUNT(*) FILTER (WHERE m.type = 'CONSUME') AS outs_cnt,
  SUM(CASE WHEN m.type = 'RECEIVE' THEN m.quantity ELSE 0 END) AS ins_qty,
  SUM(CASE WHEN m.type = 'CONSUME' THEN m.quantity ELSE 0 END) AS outs_qty
FROM public.movements m
GROUP BY 1
ORDER BY 1;

-- v_monthly_activity: activity per calendar month (YYYY-MM)
CREATE OR REPLACE VIEW public.v_monthly_activity AS
SELECT
  to_char(date_trunc('month', m.created_at), 'YYYY-MM') AS month,
  COUNT(*) FILTER (WHERE m.type = 'RECEIVE') AS ins_cnt,
  COUNT(*) FILTER (WHERE m.type = 'CONSUME') AS outs_cnt,
  SUM(CASE WHEN m.type = 'RECEIVE' THEN m.quantity ELSE 0 END) AS ins_qty,
  SUM(CASE WHEN m.type = 'CONSUME' THEN m.quantity ELSE 0 END) AS outs_qty
FROM public.movements m
GROUP BY 1
ORDER BY 1;

-- v_kpi_summary: single-row KPIs
CREATE OR REPLACE VIEW public.v_kpi_summary AS
SELECT
  (SELECT COUNT(*) FROM public.parts) AS parts_count,
  (SELECT COUNT(*) FROM public.aircraft) AS aircraft_count,
  (SELECT stock_value FROM public.v_stock_valuation) AS stock_value,
  (SELECT COUNT(*) FROM public.quotes WHERE status = 'SENT') AS quotes_sent,
  (SELECT COUNT(*) FROM public.quotes WHERE status = 'ACCEPTED') AS quotes_approved,
  COALESCE(
    ROUND(100.0 * (SELECT COUNT(*) FROM public.quotes WHERE status = 'ACCEPTED')
      / NULLIF((SELECT COUNT(*) FROM public.quotes WHERE status = 'SENT'), 0), 2),
    0
  ) AS conversion_rate_pct,
  COALESCE(
    (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (w.closed_at - w.created_at))/86400)::numeric, 2)
      FROM public.work_orders w
      WHERE w.closed_at IS NOT NULL
    ),
    0
  ) AS avg_wo_days;

