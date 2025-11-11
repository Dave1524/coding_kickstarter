# Fix RLS Policy Error for Email Registration

## Error
```
new row violates row-level security policy for table "early_access_emails"
```

## Quick Fix (Choose One)

### Option 1: Use Service Role Key (Easiest - Recommended)

The service role key bypasses RLS policies entirely. This is the simplest solution:

1. **Get your Service Role Key:**
   - Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API
   - Scroll down to "Project API keys"
   - Copy the `service_role` key (⚠️ Keep this secret!)

2. **Add to `.env.local`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

That's it! The service role key bypasses all RLS policies.

---

### Option 2: Fix RLS Policies (If you want to use anon key)

If you prefer to use the anonymous key, you need to set up RLS policies:

1. **Go to Supabase Dashboard:**
   - Navigate to: SQL Editor → New Query

2. **Run this SQL:**
   ```sql
   -- Enable RLS
   ALTER TABLE public.early_access_emails ENABLE ROW LEVEL SECURITY;

   -- Drop existing policies if they exist
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

   -- Create policy for anonymous updates (needed for upsert)
   CREATE POLICY "Allow anonymous update"
     ON public.early_access_emails
     FOR UPDATE
     TO anon
     USING (true)
     WITH CHECK (true);
   ```

3. **Click "Run"** to execute the SQL

4. **Verify policies exist:**
   - Go to: Table Editor → `early_access_emails` → Click "Policies" tab
   - You should see two policies: "Allow anonymous insert" and "Allow anonymous update"

---

## Verify Your Setup

After applying either fix, test the email registration again. It should work!

## Still Having Issues?

1. **Check your `.env.local` has:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # If using Option 1
   ```

2. **Check the table exists:**
   - Go to: Table Editor → Look for `early_access_emails` table
   - If it doesn't exist, run the migration in `supabase/migrations/create_early_access_emails.sql`

3. **Check RLS is enabled:**
   - Go to: Table Editor → `early_access_emails` → Settings
   - Ensure "Enable Row Level Security" is checked

4. **Restart your dev server** after making changes

