# Environment Variables - Add These to Your .env.local

Add these lines to your `.env.local` file (it's already gitignored, so your secrets are safe!):

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://sgjoakhuqpwuedwwetyag.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-only: Supabase admin access (for fetching secrets from database)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnam9ha2h1Z3B3dWVkd2V0eWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE5NzI1OSwiZXhwIjoyMDc2NzczMjU5fQ._fCe2A0KeTMuOM2qwo1rmqlAqXmF3GQfmqygy0LCNHc

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your-openai-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Important Security Notes:
- ✅ `.env.local` is gitignored - your secrets won't be committed
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is server-only (never exposed to browser)
- ✅ `OPENAI_API_KEY` is server-only (never exposed to browser)
- ⚠️ Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser

## To Get Your OpenAI API Key:
1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy it and paste it as `OPENAI_API_KEY` in `.env.local`
5. Restart your dev server: `npm run dev`

