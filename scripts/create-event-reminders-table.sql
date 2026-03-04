-- Event Reminders table
-- Tracks which reminders have been sent for each event to prevent duplicates.
-- Reminder types: '7d' (7 days before), '1d' (1 day before), 'day_of' (day of event)

CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('7d', '1d', 'day_of')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, reminder_type)
);

-- Enable Row Level Security
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- Service-role policy for server-side access
CREATE POLICY "Service role can manage event_reminders"
  ON event_reminders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for efficient lookups by event_id
CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON event_reminders(event_id);
