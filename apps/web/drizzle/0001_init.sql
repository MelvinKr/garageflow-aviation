-- Parts
CREATE TABLE IF NOT EXISTS parts (
  id varchar(32) PRIMARY KEY,
  sku varchar(64) NOT NULL,
  name varchar(256) NOT NULL,
  category varchar(64),
  supplier_id varchar(32),
  unit_cost numeric(10,2) DEFAULT 0,
  qty integer DEFAULT 0,
  reserved_qty integer DEFAULT 0,
  min_qty integer DEFAULT 0,
  location varchar(64),
  cert varchar(64),
  cert_url varchar(512),
  photo_url varchar(512)
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id varchar(32) PRIMARY KEY,
  name varchar(128) NOT NULL,
  email varchar(256),
  phone varchar(64),
  address varchar(512),
  currency varchar(8),
  lead_time_days integer
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id varchar(32) PRIMARY KEY,
  name varchar(128) NOT NULL,
  contact varchar(128),
  email varchar(256),
  phone varchar(64),
  terms varchar(32),
  address varchar(512)
);

-- Aircraft
CREATE TABLE IF NOT EXISTS aircraft (
  id varchar(32) PRIMARY KEY,
  reg varchar(32) NOT NULL,
  type varchar(64),
  hours numeric(10,1),
  cycles integer,
  base varchar(32),
  owner_id varchar(32),
  next_due jsonb
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id varchar(32) PRIMARY KEY,
  customer_id varchar(32) NOT NULL,
  aircraft_id varchar(32) NOT NULL,
  status varchar(16) NOT NULL,
  discount_pct numeric(5,2) DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Quote Items
CREATE TABLE IF NOT EXISTS quote_items (
  id varchar(36) PRIMARY KEY,
  quote_id varchar(32) NOT NULL,
  kind varchar(8) NOT NULL,
  label varchar(256) NOT NULL,
  part_id varchar(32),
  qty numeric(10,2),
  unit numeric(10,2),
  hours numeric(10,2),
  rate numeric(10,2)
);

-- Work Orders
CREATE TABLE IF NOT EXISTS workorders (
  id varchar(32) PRIMARY KEY,
  quote_id varchar(32),
  aircraft_id varchar(32) NOT NULL,
  status varchar(24) NOT NULL,
  opened_at timestamp DEFAULT now(),
  closed_at timestamp,
  notes varchar(1024)
);

-- WO Tasks
CREATE TABLE IF NOT EXISTS wo_tasks (
  id varchar(36) PRIMARY KEY,
  wo_id varchar(32) NOT NULL,
  label varchar(256) NOT NULL,
  part_id varchar(32),
  qty numeric(10,2),
  done boolean DEFAULT false,
  hours numeric(10,2),
  rate numeric(10,2)
);

-- Movements
CREATE TABLE IF NOT EXISTS movements (
  id varchar(40) PRIMARY KEY,
  part_id varchar(32) NOT NULL,
  type varchar(12) NOT NULL,
  qty numeric(10,2) NOT NULL,
  reason varchar(128),
  ref varchar(64),
  by varchar(64),
  at timestamp DEFAULT now()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id varchar(32) PRIMARY KEY,
  supplier_id varchar(32) NOT NULL,
  status varchar(24) NOT NULL,
  created_at timestamp DEFAULT now(),
  expected_at timestamp
);

-- PO Items
CREATE TABLE IF NOT EXISTS po_items (
  id varchar(36) PRIMARY KEY,
  po_id varchar(32) NOT NULL,
  part_id varchar(32) NOT NULL,
  qty numeric(10,2) NOT NULL,
  unit_cost numeric(10,2)
);

