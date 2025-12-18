-- Row Level Security (RLS) Policies for InnerCompass Mini
-- These policies ensure users can only access their own data

-- Enable RLS on journal_entries table
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Enable RLS on journal_outputs table
ALTER TABLE journal_outputs ENABLE ROW LEVEL SECURITY;

-- Policies for journal_entries table

-- Users can insert their own entries
CREATE POLICY "Users can insert own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can select their own entries
CREATE POLICY "Users can select own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policies for journal_outputs table

-- Users can insert their own outputs
CREATE POLICY "Users can insert own outputs"
  ON journal_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can select their own outputs
CREATE POLICY "Users can select own outputs"
  ON journal_outputs FOR SELECT
  USING (auth.uid() = user_id);

-- Notes:
-- - RLS policies are enforced when using the anon key
-- - auth.uid() returns the current authenticated user's ID
-- - WITH CHECK is used for INSERT/UPDATE to validate new rows
-- - USING is used for SELECT/UPDATE/DELETE to filter existing rows
-- - Service role key bypasses RLS—use it only in trusted server code
