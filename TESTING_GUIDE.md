# 🧪 Testing Guide - AI Generate API

## Prerequisites

Before testing, make sure you have:

1. ✅ OpenAI API key added to `.env.local`
2. ✅ Service role key added to `.env.local` (optional, for Supabase secrets)
3. ✅ Dev server restarted after adding env vars

---

## 📋 Your `.env.local` Should Look Like This:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sgjoakhugpwuedwwetyag.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnam9ha2h1Z3B3dWVkd2V0eWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE5NzI1OSwiZXhwIjoyMDc2NzczMjU5fQ._fCe2A0KeTMuOM2qwo1rmqlAqXmF3GQfmqygy0LCNHc

# OpenAI (GET THIS FROM: https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your-actual-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Step 1: Get Your OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. **IMPORTANT:** Copy it immediately (you won't see it again!)
5. Paste it in `.env.local` as `OPENAI_API_KEY=sk-proj-...`

---

## 🔧 Step 2: Restart Your Dev Server

**CRITICAL:** Next.js only loads `.env.local` at startup!

```bash
# Stop the server (Ctrl+C)
# Then start it again:
npm run dev
```

---

## ✅ Step 3: Test with Browser (Recommended)

1. Open: http://localhost:3000
2. You should see the "Coding Kickstarter" landing page
3. In the textarea, type: **"Todo app for 100 users"**
4. Click **"Generate Setup Guide"**
5. Wait 3-10 seconds (AI is thinking!)

**Expected Result:**
- ✅ 3-4 clarifying questions appear
- ✅ Top 5 setup steps with commands
- ✅ A Kanban board in markdown

---

## 🧪 Step 4: Test with Terminal (Advanced)

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"idea":"Todo app for 100 users"}'
```

**Expected JSON Response:**
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "idea": "Todo app for 100 users",
  "questions": [
    "Do you need user authentication?",
    "Will users share todos or keep them private?",
    "What's your expected scale?"
  ],
  "steps": [
    "1. Create GitHub repo: `git init`",
    "2. Install Next.js: `npx create-next-app@latest`",
    "..."
  ],
  "kanbanMarkdown": "### 📋 To Do\n- [ ] Setup repo\n...",
  "timestamp": "2025-01-23T..."
}
```

---

## 🆘 Troubleshooting

### Error: "OpenAI API key not configured"

**Fix:**
1. Check `.env.local` has `OPENAI_API_KEY=sk-proj-...`
2. Make sure you saved the file (Ctrl+S)
3. Restart dev server: Stop (Ctrl+C), then `npm run dev`

### Error: "Empty response from OpenAI"

**Fix:**
1. Check your OpenAI account has credits: https://platform.openai.com/usage
2. Verify your API key is valid (not expired)
3. Try a different idea (simpler prompt)

### Error: "Invalid response structure"

**Fix:**
- OpenAI occasionally returns malformed JSON
- Just click "Generate" again - it usually works on retry
- If persistent, check OpenAI status: https://status.openai.com

---

## 📝 Sample Test Ideas

Try these in the input form:

1. **"Todo app for 100 users"** ← Recommended first test
2. **"Chat app for teams"**
3. **"Weather dashboard with public APIs"**
4. **"E-commerce store with Stripe payments"**
5. **"Blog with markdown support"**

---

## 🎯 What to Expect

For "Todo app for 100 users", you should get:

**Questions:**
- Do you need user authentication?
- Will todos be private or shared?
- What database (Supabase, Firebase)?
- Expected daily active users?

**Steps:**
1. Create GitHub repo: `git init`, `git remote add origin ...`
2. Initialize Next.js: `npx create-next-app@latest`
3. Setup Supabase: Create project, add URL/keys to `.env.local`
4. Install dependencies: `npm install @supabase/supabase-js`
5. Deploy to Vercel: `vercel deploy`

**Kanban:**
```
### 📋 To Do
- [ ] Setup GitHub repo
- [ ] Configure Supabase
- [ ] Build todo CRUD

### 🔄 In Progress
- [ ] Design UI

### ✅ Done
- [x] Read setup guide
```

---

## ✅ Success Checklist

After testing, you should have:

- [ ] Browser UI shows colorful, fun interface
- [ ] Input form accepts project ideas
- [ ] "Generate" button triggers API call
- [ ] Questions section appears with 3-4 items
- [ ] Steps section shows 5 actionable items
- [ ] Kanban board displays in markdown format
- [ ] "Try another idea" button clears results
- [ ] No console errors in browser dev tools

---

## 🚀 Next Steps

Once testing works:

1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat(ai): add OpenAI generate API and landing form"
   git push
   ```

2. Optional: Store OpenAI key in Supabase (more secure)
3. Add PDF export feature (next milestone!)
4. Deploy to Vercel

---

## 💡 Pro Tips

- **Cost:** GPT-4o-mini costs ~$0.001 per request (very cheap!)
- **Rate limits:** Free tier: 3 requests/min. Paid tier: Much higher.
- **Speed:** Responses take 3-10 seconds depending on complexity
- **Quality:** More detailed ideas = better responses

---

**Ready to test? Run `npm run dev` and visit http://localhost:3000!** 🚀

