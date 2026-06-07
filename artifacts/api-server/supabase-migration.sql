-- Arete – run this in your Supabase SQL Editor before starting the app
-- Dashboard: https://supabase.com/dashboard/project/<your-project-ref>/sql/new

CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name     TEXT NOT NULL,
  amount_usdc     NUMERIC(18, 6) NOT NULL,
  recipient_wallet TEXT NOT NULL,
  reference_id    TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  solana_pay_url  TEXT NOT NULL,
  tx_signature    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ
);

-- Optional: disable Row Level Security for the service role key (already bypassed by service role, but makes intent explicit)
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
