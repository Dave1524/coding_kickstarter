# 🐛 Debug Summary: Blueprint Column Missing

## Error
```
Supabase insert error: {
  code: 'PGRST204',
  message: 'Could not find the 'blueprint' column of 'generated_sprints' in the schema cache'
}
```

## What Happened
Your API code was trying to insert data into columns that don't exist yet in your Supabase table:
- `questions` ← Missing
- `steps` ← Missing  
- `blueprint` ← Missing

You only ran the RLS policy SQL, but not the ALTER TABLE commands that create the columns.

## Solution: 3 Steps

### **Step 1: Copy the SQL**
From `supabase/migrations/add_sprint_columns.md` or use this:
```sql
ALTER TABLE generated_sprints 
ADD COLUMN IF NOT EXISTS questions jsonb DEFAULT '[]'::jsonb;

ALTER TABLE generated_sprints 
ADD COLUMN IF NOT EXISTS steps jsonb DEFAULT '[]'::jsonb;

ALTER TABLE generated_sprints 
ADD COLUMN IF NOT EXISTS blueprint jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_generated_sprints_user_id ON generated_sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_sprints_created_at ON generated_sprints(created_at DESC);
```

### **Step 2: Run in Supabase**
1. Go to https://app.supabase.com
2. Click **SQL Editor** → **New Query**
3. Paste the SQL
4. Click **Run**

### **Step 3: Restart Your App**
```bash
npm run dev
```

## Code That's Already Ready
✅ **app/api/save-sprint/route.ts** - Expects the new schema
✅ **app/api/history/route.ts** - Fetches user's sprints
✅ **app/page.tsx** - Save button sends correct payload
✅ **utils/supabase/server.ts** - Creates Supabase client
✅ **package.json** - Has `uuid` dependency

All files are synchronized and just waiting for the database schema to match!

## Test It
1. Generate a sprint
2. Click "💾 Save Sprint"
3. Check Supabase Table Editor
4. ✅ You should see the new row with all fields populated

---

## Files Modified/Created Today

| File | What Changed |
|------|-------------|
| `app/api/save-sprint/route.ts` | NEW - Saves sprint with user tracking |
| `app/api/history/route.ts` | NEW - Fetches user's saved sprints |
| `app/page.tsx` | Updated - Added save button + state |
| `utils/supabase/server.ts` | Updated - Exports createClient() |
| `package.json` | Updated - Added uuid dependency |
| `supabase/migrations/add_sprint_columns.sql` | NEW - Migration file |
| `supabase/migrations/add_sprint_columns.md` | NEW - Quick reference |

---

## What's Next
- [ ] Run the migration SQL
- [ ] Restart dev server
- [ ] Test save functionality
- [ ] Build `/history` page to display saved sprints
- [ ] Deploy to Vercel
