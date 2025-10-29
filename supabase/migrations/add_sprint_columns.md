# Copy-Paste This SQL into Supabase Dashboard

**Steps:**
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Copy everything below and paste it
5. Click **Run**

---

```sql
-- Add missing columns to generated_sprints table for the save sprint feature

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

---

**After running:**
1. Restart your dev server: `npm run dev`
2. Try saving a sprint again ✅
