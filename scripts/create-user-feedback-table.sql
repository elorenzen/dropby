-- Migration: Create user_feedback table for bug reports / feature requests
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  type text NOT NULL CHECK (type IN ('bug', 'feature_request', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'approved', 'working_on_it', 'done')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz
);

-- Index on status for admin filtering
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);

-- Index on created_at for default sort order
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- Index on user_id for looking up feedback by user
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);

-- RLS policies
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own feedback
CREATE POLICY "Users can insert feedback"
  ON user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to read their own feedback
CREATE POLICY "Users can read own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role bypasses RLS, so admin GET/PATCH routes use serverSupabaseServiceRole
