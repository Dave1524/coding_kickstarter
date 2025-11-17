# Troubleshooting: Service Role Key Not Found

## Quick Checklist

1. **Is the key in `.env.local`?** (Not `.env` or `.env.example`)
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Did you restart the dev server?**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again
   - Next.js only reads `.env.local` on startup

3. **Is the key name correct?**
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` (recommended)
   - ✅ `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (also works, but not recommended)

4. **No quotes around the value:**
   ```env
   # ✅ Correct
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # ❌ Wrong (don't use quotes)
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

5. **No spaces around the `=` sign:**
   ```env
   # ✅ Correct
   SUPABASE_SERVICE_ROLE_KEY=value
   
   # ❌ Wrong
   SUPABASE_SERVICE_ROLE_KEY = value
   ```

## How to Get Your Service Role Key

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find the **`service_role`** key (NOT the `anon` key)
6. Click the eye icon to reveal it
7. Copy the entire key (it's very long, starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Example `.env.local` File

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here
```

## Still Not Working?

1. **Check the error message** - it will show debug info in development mode
2. **Verify the file is named `.env.local`** (not `.env` or `.env.example`)
3. **Check file location** - should be in the root directory (same folder as `package.json`)
4. **Try adding both variants:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-key-here
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-key-here
   ```
5. **Restart your dev server completely** - close terminal and reopen

## Edge Runtime Note

If you're using Edge runtime (`export const runtime = 'edge'`), make sure:
- The env var doesn't have `NEXT_PUBLIC_` prefix (Edge runtime handles server vars fine)
- You've restarted the server after adding the var







