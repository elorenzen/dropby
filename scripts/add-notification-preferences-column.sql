-- Add notification_preferences JSONB column to users table
-- Defaults all notification channels to true so existing users keep receiving notifications
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_event_requests": true,
  "email_booking_confirmations": true,
  "email_event_reminders": true,
  "email_reviews": true,
  "email_event_invites": true,
  "sms_event_requests": true,
  "sms_booking_confirmations": true,
  "sms_event_reminders": true,
  "sms_reviews": true,
  "sms_event_invites": true
}'::jsonb;
