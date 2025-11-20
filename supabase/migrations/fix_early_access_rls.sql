-- Fix RLS policies for early_access_emails table
-- Run this in Supabase SQL Editor if you're getting RLS policy violations

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.early_access_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  idea TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.early_access_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "anon can insert early access" ON public.early_access_emails;
DROP POLICY IF EXISTS "anon can update early access" ON public.early_access_emails;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.early_access_emails;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.early_access_emails;

-- Create policy for anonymous inserts
CREATE POLICY "Allow anonymous insert"
  ON public.early_access_emails
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for anonymous updates (needed for upsert operations)
CREATE POLICY "Allow anonymous update"
  ON public.early_access_emails
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow service role full access (bypasses RLS)
CREATE POLICY "Allow service role full access"
  ON public.early_access_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_early_access_emails_email ON public.early_access_emails(email);
CREATE INDEX IF NOT EXISTS idx_early_access_emails_created_at ON public.early_access_emails(created_at DESC);










