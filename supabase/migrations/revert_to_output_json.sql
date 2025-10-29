-- Revert schema: Drop new columns and use output_json
-- Run this in Supabase SQL Editor

-- Drop the new columns we added
ALTER TABLE generated_sprints 
DROP COLUMN IF EXISTS questions;

ALTER TABLE generated_sprints 
DROP COLUMN IF EXISTS steps;

ALTER TABLE generated_sprints 
DROP COLUMN IF EXISTS blueprint;

-- Verify output_json exists and has proper constraints
-- (These should already exist, but ensuring they do)
ALTER TABLE generated_sprints 
ALTER COLUMN output_json SET NOT NULL;

-- Keep the useful indexes
CREATE INDEX IF NOT EXISTS idx_generated_sprints_user_id ON generated_sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_sprints_created_at ON generated_sprints(created_at DESC);
