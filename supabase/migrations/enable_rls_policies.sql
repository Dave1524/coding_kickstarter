-- Enable Row Level Security (RLS) on generated_sprints table
-- This migration sets up security policies for anonymous access

-- Enable RLS
ALTER TABLE generated_sprints ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert sprints
CREATE POLICY "Allow anonymous insert"
ON generated_sprints
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Allow anonymous users to select their own sprints
-- Note: This allows all anonymous users to see all sprints
-- If you want to restrict to user_id matching, use:
-- USING (auth.uid()::text = user_id OR user_id IS NULL)
CREATE POLICY "Allow anonymous select"
ON generated_sprints
FOR SELECT
TO anon
USING (true);

-- Policy: Allow service role full access (bypasses RLS)
-- Service role key automatically bypasses RLS, but explicit policy for clarity
CREATE POLICY "Allow service role full access"
ON generated_sprints
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to update/delete their own sprints
-- (For future auth implementation)
CREATE POLICY "Allow users to update own sprints"
ON generated_sprints
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to delete own sprints"
ON generated_sprints
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Ensure user_id column exists and is nullable for anonymous users
ALTER TABLE generated_sprints
ALTER COLUMN user_id DROP NOT NULL;

-- Add index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_sprints_user_id ON generated_sprints(user_id);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_generated_sprints_created_at ON generated_sprints(created_at DESC);







