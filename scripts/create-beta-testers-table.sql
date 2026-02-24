-- Create beta_testers table
CREATE TABLE IF NOT EXISTS beta_testers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on email for fast lookups during beta check
CREATE INDEX IF NOT EXISTS idx_beta_testers_email ON beta_testers (email);

-- Enable RLS
ALTER TABLE beta_testers ENABLE ROW LEVEL SECURITY;

-- Service-role (server API) can do everything; no client-side direct access needed
CREATE POLICY "Service role full access" ON beta_testers
  FOR ALL
  USING (true)
  WITH CHECK (true);
