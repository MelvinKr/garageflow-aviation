-- Basic GRANTs and RLS policies to allow SSR anon reads safely

-- Ensure anon/authenticated can access schema objects
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Parts: public read
GRANT SELECT ON TABLE public.parts TO anon, authenticated;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS parts_read_all ON public.parts;
CREATE POLICY parts_read_all ON public.parts FOR SELECT USING (true);

-- Suppliers: public read
GRANT SELECT ON TABLE public.suppliers TO anon, authenticated;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS suppliers_read_all ON public.suppliers;
CREATE POLICY suppliers_read_all ON public.suppliers FOR SELECT USING (true);

-- Customers: authenticated read
GRANT SELECT ON TABLE public.customers TO authenticated;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customers_read_auth ON public.customers;
CREATE POLICY customers_read_auth ON public.customers FOR SELECT USING (auth.role() = 'authenticated');

-- Aircraft: public read
GRANT SELECT ON TABLE public.aircraft TO anon, authenticated;
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aircraft_read_all ON public.aircraft;
CREATE POLICY aircraft_read_all ON public.aircraft FOR SELECT USING (true);

-- Quotes (header): authenticated read
GRANT SELECT ON TABLE public.quotes TO authenticated;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS quotes_read_auth ON public.quotes;
CREATE POLICY quotes_read_auth ON public.quotes FOR SELECT USING (auth.role() = 'authenticated');

-- Movements: authenticated read (often considered sensitive)
GRANT SELECT ON TABLE public.movements TO authenticated;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS movements_read_auth ON public.movements;
CREATE POLICY movements_read_auth ON public.movements FOR SELECT USING (auth.role() = 'authenticated');

-- Work orders: authenticated read
GRANT SELECT ON TABLE public.work_orders TO authenticated;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS work_orders_read_auth ON public.work_orders;
CREATE POLICY work_orders_read_auth ON public.work_orders FOR SELECT USING (auth.role() = 'authenticated');

-- Purchase orders: authenticated read
GRANT SELECT ON TABLE public.purchase_orders TO authenticated;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS po_read_auth ON public.purchase_orders;
CREATE POLICY po_read_auth ON public.purchase_orders FOR SELECT USING (auth.role() = 'authenticated');

-- Purchase order items: authenticated read
GRANT SELECT ON TABLE public.purchase_order_items TO authenticated;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poi_read_auth ON public.purchase_order_items;
CREATE POLICY poi_read_auth ON public.purchase_order_items FOR SELECT USING (auth.role() = 'authenticated');

-- Quote items: authenticated read
GRANT SELECT ON TABLE public.quote_items TO authenticated;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS qi_read_auth ON public.quote_items;
CREATE POLICY qi_read_auth ON public.quote_items FOR SELECT USING (auth.role() = 'authenticated');

-- Work order parts: authenticated read
GRANT SELECT ON TABLE public.work_order_parts TO authenticated;
ALTER TABLE public.work_order_parts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wop_read_auth ON public.work_order_parts;
CREATE POLICY wop_read_auth ON public.work_order_parts FOR SELECT USING (auth.role() = 'authenticated');

-- Work order tasks: authenticated read
GRANT SELECT ON TABLE public.work_order_tasks TO authenticated;
ALTER TABLE public.work_order_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wot_read_auth ON public.work_order_tasks;
CREATE POLICY wot_read_auth ON public.work_order_tasks FOR SELECT USING (auth.role() = 'authenticated');

-- Attachments: authenticated read (often contains URLs)
GRANT SELECT ON TABLE public.attachments TO authenticated;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS att_read_auth ON public.attachments;
CREATE POLICY att_read_auth ON public.attachments FOR SELECT USING (auth.role() = 'authenticated');

-- Part suppliers: authenticated read
GRANT SELECT ON TABLE public.part_suppliers TO authenticated;
ALTER TABLE public.part_suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ps_read_auth ON public.part_suppliers;
CREATE POLICY ps_read_auth ON public.part_suppliers FOR SELECT USING (auth.role() = 'authenticated');

-- Part compat aircraft: public read of compatibility map
GRANT SELECT ON TABLE public.part_compat_aircraft TO anon, authenticated;
ALTER TABLE public.part_compat_aircraft ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pca_read_all ON public.part_compat_aircraft;
CREATE POLICY pca_read_all ON public.part_compat_aircraft FOR SELECT USING (true);

-- NOTE: service_role bypasses RLS, so write operations continue to work
-- via sbAdmin() in server code without extra policies.

