-- Enums
DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM ('CONSUME','RECEIVE','ADJUST');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('DRAFT','SENT','ACCEPTED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS parts (
  id serial PRIMARY KEY,
  part_number varchar(64) NOT NULL UNIQUE,
  name text NOT NULL,
  on_hand integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movements (
  id serial PRIMARY KEY,
  part_id integer NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  type movement_type NOT NULL,
  quantity integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id serial PRIMARY KEY,
  status quote_status NOT NULL DEFAULT 'DRAFT',
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id serial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

-- Indexes utiles pour /reports
CREATE INDEX IF NOT EXISTS idx_movements_part_id_created_at ON movements(part_id, created_at);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_closed_at ON work_orders(closed_at);

