-- Add beta testers requested in issue #67
-- Uses ON CONFLICT to safely skip if the email already exists

INSERT INTO beta_testers (email, notes)
VALUES
  ('eric.lorenzen@gmail.com', 'Added via issue #67'),
  ('ericlorenzen@myyahoo.com', 'Added via issue #67')
ON CONFLICT (email) DO NOTHING;
