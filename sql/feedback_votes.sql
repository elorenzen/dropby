-- =============================================================================
-- Feedback Votes: allows authenticated users to upvote bug reports / features.
-- Run this in the Supabase SQL Editor.
-- =============================================================================

-- 1. Add vote_count column to user_feedback (idempotent)
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- 2. Create feedback_votes join table
CREATE TABLE IF NOT EXISTS feedback_votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES user_feedback(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- 3. Trigger function: increment vote_count on insert
CREATE OR REPLACE FUNCTION increment_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_feedback
     SET vote_count = COALESCE(vote_count, 0) + 1
   WHERE id = NEW.feedback_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger function: decrement vote_count on delete
CREATE OR REPLACE FUNCTION decrement_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_feedback
     SET vote_count = GREATEST(COALESCE(vote_count, 0) - 1, 0)
   WHERE id = OLD.feedback_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach triggers (drop first to make re-runs safe)
DROP TRIGGER IF EXISTS on_feedback_vote_insert ON feedback_votes;
CREATE TRIGGER on_feedback_vote_insert
  AFTER INSERT ON feedback_votes
  FOR EACH ROW EXECUTE FUNCTION increment_feedback_vote_count();

DROP TRIGGER IF EXISTS on_feedback_vote_delete ON feedback_votes;
CREATE TRIGGER on_feedback_vote_delete
  AFTER DELETE ON feedback_votes
  FOR EACH ROW EXECUTE FUNCTION decrement_feedback_vote_count();

-- 6. Row-Level Security
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own votes"
  ON feedback_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON feedback_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all votes"
  ON feedback_votes FOR SELECT TO authenticated
  USING (true);
