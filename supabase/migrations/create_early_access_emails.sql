-- Create early_access_emails table for email signups
-- Run this in Supabase SQL Editor

create table if not exists public.early_access_emails (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  idea text,
  source text,
  created_at timestamptz not null default now()
);

alter table public.early_access_emails enable row level security;

create policy "anon can insert early access"
  on public.early_access_emails
  for insert
  to anon
  with check (true);

-- Create index on email for faster lookups
create index if not exists idx_early_access_emails_email on public.early_access_emails(email);

-- Create index on created_at for sorting
create index if not exists idx_early_access_emails_created_at on public.early_access_emails(created_at desc);

