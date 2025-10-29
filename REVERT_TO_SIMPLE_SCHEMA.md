# ✅ Reverted to Simple Schema: `{ idea, output_json }`

## What Changed
We're reverting from the complex multi-column schema back to the original simpler approach:

**Before (Complex):** `user_id`, `idea`, `questions`, `steps`, `blueprint`  
**After (Simple):** `idea`, `output_json` (stores entire result as JSONB)

## Step 1: Drop Extra Columns in Supabase

1. Go to https://app.supabase.com
2. Click **SQL Editor** → **New Query**
3. Paste this:

```sql
-- Drop the new columns we added
ALTER TABLE generated_sprints 
DROP COLUMN IF EXISTS questions;

ALTER TABLE generated_sprints 
DROP COLUMN IF EXISTS steps;

ALTER TABLE generated_sprints 
DROP COLUMN IF EXISTS blueprint;

-- Ensure output_json is NOT NULL
ALTER TABLE generated_sprints 
ALTER COLUMN output_json SET NOT NULL;

-- Keep useful indexes
CREATE INDEX IF NOT EXISTS idx_generated_sprints_user_id ON generated_sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_sprints_created_at ON generated_sprints(created_at DESC);
```

4. Click **Run**

## Step 2: Code is Already Updated

All files have been reverted:

✅ **app/api/save-sprint/route.ts**
- Now sends: `{ idea, output_json }`
- Simpler validation
- No user tracking

✅ **app/api/history/route.ts**
- Fetches all sprints (no user filtering)
- Simpler query

✅ **app/page.tsx**
- handleSave sends: `{ idea, output_json: result }`
- No extra payload transformation

✅ **package.json**
- Removed `uuid` dependency

## Step 3: Test It

1. Restart dev server: `npm run dev`
2. Generate a sprint
3. Click "💾 Save Sprint"
4. ✅ Should work now!

## What Gets Stored

In your `generated_sprints` table:

```json
{
  "id": "uuid",
  "idea": "Todo app for 100 users",
  "output_json": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "idea": "Todo app for 100 users",
    "questions": [...],
    "steps": [...],
    "kanbanMarkdown": "...",
    "timestamp": "2025-10-29T..."
  },
  "created_at": "2025-10-29T..."
}
```

Everything is stored in `output_json` - clean and simple! 🎉

## Files Changed

| File | Change |
|------|--------|
| `app/api/save-sprint/route.ts` | Reverted to simple `{ idea, output_json }` |
| `app/api/history/route.ts` | Simplified to fetch all sprints |
| `app/page.tsx` | Updated handleSave payload |
| `package.json` | Removed `uuid` |
| `supabase/migrations/revert_to_output_json.sql` | NEW - Migration to drop columns |

---

## Next Steps

- [ ] Run the migration SQL
- [ ] Restart dev server  
- [ ] Test save functionality
- [ ] Build `/history` page UI
- [ ] Deploy to Vercel
