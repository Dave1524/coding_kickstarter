# 🔑 Environment Variables Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard
2. Click on your project
3. Go to: **Settings** → **API**
4. Copy these values:

---

## Step 2: Create Your `.env.local` File

**In your project root (`coding_kickstarter` folder), create a file named `.env.local`**

**Right-click in file explorer** → New File → Name it: `.env.local`

Then paste this (replace with YOUR values):

```env
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

# Optional but recommended for server operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

# AI API Keys (add these later when you get them)
OPENAI_API_KEY=sk-proj-your-key-here
GROK_API_KEY=your-grok-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3: Verify `.env.local` is in `.gitignore`

Your `.gitignore` should already have this line:
```
.env*.local
```

This protects your secrets from being committed to GitHub! ✅

---

## What Each Variable Does:

| Variable | Purpose | Safe for Browser? |
|----------|---------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (server only) | ❌ NO! Server only |
| `OPENAI_API_KEY` | OpenAI API access | ❌ NO! Server only |
| `GROK_API_KEY` | Grok API access | ❌ NO! Server only |

---

## Important Security Rules:

✅ **DO:**
- Use `NEXT_PUBLIC_` prefix for browser-safe values
- Keep `.env.local` in `.gitignore`
- Restart your dev server after changing `.env.local`

❌ **DON'T:**
- Commit `.env.local` to GitHub
- Share your service role key publicly
- Use `NEXT_PUBLIC_` for secret keys

---

## Testing Your Setup:

Once you've created `.env.local`, run:

```bash
npm run dev
```

Then test with the API route we'll create next!

