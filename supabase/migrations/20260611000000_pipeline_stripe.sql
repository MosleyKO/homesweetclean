-- Pipeline & Stripe columns on clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'new_inquiry';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_detail text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS bedrooms text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_name text;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  stripe_invoice_id text UNIQUE,
  stripe_customer_id text,
  amount_due integer,
  amount_paid integer,
  currency text DEFAULT 'usd',
  status text,
  description text,
  invoice_url text,
  invoice_pdf text,
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  invoice_created_at timestamp with time zone
);
