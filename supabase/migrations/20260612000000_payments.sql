CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  stripe_charge_id text UNIQUE,
  stripe_customer_id text,
  amount integer,
  currency text DEFAULT 'usd',
  status text,
  description text,
  receipt_url text,
  payment_date timestamp with time zone
);
