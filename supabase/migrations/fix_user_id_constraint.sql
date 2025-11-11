-- Fix user_id foreign key constraint for anonymous users
-- Run this in Supabase SQL Editor if you get foreign key errors when saving sprints

-- Make user_id nullable (allows null values for anonymous users)
ALTER TABLE generated_sprints 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop the foreign key constraint (since we don't have auth set up yet)
ALTER TABLE generated_sprints 
DROP CONSTRAINT IF EXISTS generated_sprints_user_id_fkey;

-- Optional: If you want to keep the foreign key for future auth, use this instead:
-- ALTER TABLE generated_sprints 
-- DROP CONSTRAINT IF EXISTS generated_sprints_user_id_fkey;
-- 
-- ALTER TABLE generated_sprints
-- ADD CONSTRAINT generated_sprints_user_id_fkey 
-- FOREIGN KEY (user_id) 
-- REFERENCES auth.users(id) 
-- ON DELETE SET NULL;

