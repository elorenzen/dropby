-- Event Invites table
-- Tracks vendor invitations sent by merchants when creating events.
-- Supports both platform vendors (by vendor_id) and external vendors (by email + token).

CREATE TABLE IF NOT EXISTS event_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  external_vendor_name TEXT,
  external_vendor_phone TEXT,
  external_vendor_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, email),
  UNIQUE (token)
);

-- Enable Row Level Security
ALTER TABLE event_invites ENABLE ROW LEVEL SECURITY;

-- Service-role policy for server-side access
CREATE POLICY "Service role can manage event_invites"
  ON event_invites
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_event_invites_event_id ON event_invites(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invites_merchant_id ON event_invites(merchant_id);
CREATE INDEX IF NOT EXISTS idx_event_invites_vendor_id ON event_invites(vendor_id);
CREATE INDEX IF NOT EXISTS idx_event_invites_token ON event_invites(token);
CREATE INDEX IF NOT EXISTS idx_event_invites_email ON event_invites(email);
