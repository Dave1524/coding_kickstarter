# Quick Fix Guide

## Issue 1: Build Error - Upstash Packages ✅ FIXED

The rate limiting packages are now optional. The code uses dynamic imports, so the build will work even if the packages aren't installed. Rate limiting will simply be disabled if Upstash Redis isn't configured.

**If you want rate limiting:**
1. Create a free Redis instance at https://console.upstash.com/
2. Add these to your `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

## Issue 2: Supabase Key Error - Email Registration

The error occurs because the code needs a Supabase key to write to the database. You have two options:

### Option A: Use Service Role Key (Recommended for Production)

1. **Get your Service Role Key:**
   - Go to your Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the anon key)
   - ⚠️ **WARNING**: This key has full database access. Never expose it to the client!

2. **Add to `.env.local`:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Ensure RLS Policies Allow Writes:**
   - Go to Supabase Dashboard → Table Editor → `early_access_emails`
   - Click "Enable RLS" if not already enabled
   - Create a policy that allows anonymous inserts:
     ```sql
     CREATE POLICY "Allow anonymous insert"
     ON early_access_emails
     FOR INSERT
     TO anon
     WITH CHECK (true);
     ```

### Option B: Use Anon Key (Works if RLS Allows It)

If you don't want to use the service role key, ensure your RLS policies allow anonymous inserts:

1. **In Supabase Dashboard:**
   - Go to Table Editor → `early_access_emails`
   - Enable RLS
   - Create policy:
     ```sql
     CREATE POLICY "Allow anonymous insert"
     ON early_access_emails
     FOR INSERT
     TO anon
     WITH CHECK (true);
     ```

2. **Your `.env.local` should have:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

The code will automatically use the anon key if the service role key isn't available.

## Verify Your Setup

1. **Check your `.env.local` file has:**
   ```
   # Required
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Optional but recommended
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

2. **Restart your dev server:**
   ```bash
   npm run dev
   ```

3. **Test the email registration** - it should work now!

## Database Tables Required

Make sure these tables exist in your Supabase project:

1. **`early_access_emails`** table:
   ```sql
   CREATE TABLE early_access_emails (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     idea TEXT,
     source TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **`generated_sprints`** table (if using save sprint feature):
   ```sql
   CREATE TABLE generated_sprints (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     idea TEXT NOT NULL,
     questions JSONB DEFAULT '[]'::jsonb,
     top_steps JSONB DEFAULT '[]'::jsonb,
     blueprint JSONB DEFAULT '{}'::jsonb,
     user_id TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

## Need Help?

If you're still getting errors:
1. Check the browser console for the exact error message
2. Check your server logs (terminal where `npm run dev` is running)
3. Verify your Supabase project URL and keys are correct
4. Ensure the tables exist and RLS policies are set up correctly










