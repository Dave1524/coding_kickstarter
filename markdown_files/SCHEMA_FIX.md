# 🔧 Schema Fix: Add Missing Columns to generated_sprints

## Problem
You're getting this error:
```
Could not find the 'blueprint' column of 'generated_sprints' in the schema cache
```

## Root Cause
The API code expects these columns in your `generated_sprints` table:
- `user_id` (uuid) - for anonymous user tracking
- `questions` (jsonb) - array of clarifying questions
- `steps` (jsonb) - array of setup steps  
- `blueprint` (jsonb) - metadata + kanban markdown

But your database table only has the basic columns.

## Solution: Run the Migration SQL

### **Option A: Via Supabase Dashboard (Recommended)**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add missing columns to generated_sprints table

-- 1. Add questions column (array of strings)
ALTER TABLE generated_sprints 
ADD COLUMN IF NOT EXISTS questions jsonb DEFAULT '[]'::jsonb;

-- 2. Add steps column (array of strings)
ALTER TABLE generated_sprints 
ADD COLUMN IF NOT EXISTS steps jsonb DEFAULT '[]'::jsonb;

-- 3. Add blueprint column (object with kanban + metadata)
ALTER TABLE generated_sprints 
ADD COLUMN IF NOT EXISTS blueprint jsonb DEFAULT '{}'::jsonb;

-- 4. Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_sprints_user_id ON generated_sprints(user_id);

-- 5. Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_generated_sprints_created_at ON generated_sprints(created_at DESC);
```

6. Click **Run** (or press `Ctrl+Enter`)
7. ✅ Done! All columns are now added.

### **Option B: Via Local Supabase (if using `supabase start`)**

Run:
```bash
supabase migration new add_sprint_columns
```

Then copy the SQL above into the migration file and run:
```bash
supabase db push
```

---

## Verify It Worked

In Supabase Dashboard:
1. Go to **Table Editor**
2. Select **generated_sprints**
3. You should see these columns:
   - `id` (uuid)
   - `user_id` (uuid)
   - `idea` (text)
   - `questions` (jsonb) ← NEW
   - `steps` (jsonb) ← NEW
   - `blueprint` (jsonb) ← NEW
   - `created_at` (timestamp)

---

## After Running Migration

1. Go back to your app terminal
2. Restart the dev server: `npm run dev`
3. Generate a sprint → Click Save
4. ✅ It should work now!

---

## If You Still Get Errors

**Clear the Supabase schema cache:**
1. In Supabase Dashboard, go to **Settings → General**
2. Scroll down and click **Restart Database** (optional, only if really stuck)

Or try in SQL Editor:
```sql
-- Refresh schema cache
SELECT pg_catalog.pg_drop_all_objects();
```

---

## Next Steps After Migration

- [ ] Run migration SQL (Option A or B above)
- [ ] Restart your dev server
- [ ] Test saving a sprint
- [ ] Build the `/history` page to display saved sprints
