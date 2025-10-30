# 🔑 How to Set Up Your .env.local File

## Problem: "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"

This means your `.env.local` file is empty or has wrong variable names.

---

## ✅ **SOLUTION: Follow These Exact Steps**

### **Step 1: Get Your Supabase Credentials**

1. Go to: https://supabase.com/dashboard
2. Click on your project
3. Click **Settings** (⚙️ gear icon, bottom left)
4. Click **API** in the sidebar
5. Copy these TWO values:

   **Project URL:**
   ```
   https://xxxxxxxxxx.supabase.co
   ```

   **anon public key** (under "Project API keys"):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

---

### **Step 2: Find/Create Your `.env.local` File**

In Cursor:
- Look in the file explorer (left sidebar)
- Find `.env.local` at the root level (same level as package.json)
- **If you don't see it:** Right-click → New File → Name it `.env.local`
- Click to open it

---

### **Step 3: Copy This EXACT Template**

**Delete everything in `.env.local` and paste this:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Then replace:**
- Line 1: Paste YOUR Project URL (from Step 1)
- Line 2: Paste YOUR anon public key (from Step 1)
- Line 3: Leave as-is

---

### **Example of a CORRECT `.env.local` File:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4MDAwMDAwMCwiZXhwIjoxODM4MDAwMDAwfQ.randomcharactershere
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### **⚠️ Common Mistakes to Avoid:**

❌ **WRONG:**
```env
NEXT_PUBLIC_SUPABASE_URL = "https://..."  # No spaces, no quotes!
```

❌ **WRONG:**
```env
SUPABASE_URL=https://...  # Must start with NEXT_PUBLIC_
```

❌ **WRONG:**
```env
NEXT_PUBLIC_SUPABASE_URL: https://...  # Use = not :
```

✅ **CORRECT:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

### **Step 4: Save the File**

Press **Ctrl+S** to save!

---

### **Step 5: Restart Dev Server**

**IMPORTANT:** Next.js only reads `.env.local` when it starts!

In terminal:
1. Press **Ctrl+C** (stop the server)
2. Wait 2 seconds
3. Run:
   ```bash
   npm run dev
   ```

---

### **Step 6: Verify It Works**

Run this command:
```bash
node check-env.js
```

**Expected output:**
```
✅ NEXT_PUBLIC_SUPABASE_URL is set
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set
```

Then visit:
```
http://localhost:3000/api/test-supabase
```

**Expected result:**
```json
{
  "status": "success",
  "message": "✅ Supabase connection successful!"
}
```

---

## 🆘 **Still Not Working?**

### Check 1: File Location
```bash
# Run this in terminal:
ls .env.local
# Should show: .env.local
```

### Check 2: File Contents
Open `.env.local` and verify:
- ✅ Variable names start with `NEXT_PUBLIC_`
- ✅ No spaces around `=`
- ✅ No quotes around values
- ✅ Your actual Supabase URL and key are there

### Check 3: Server Restart
```bash
# Make sure you stopped the old server:
# Ctrl+C
# Then start fresh:
npm run dev
```

### Check 4: Verify Environment
```bash
node check-env.js
# Should show both variables as ✅
```

---

## 📝 **Summary Checklist**

- [ ] Created/opened `.env.local` in project root
- [ ] Copied Project URL from Supabase dashboard
- [ ] Copied anon public key from Supabase dashboard
- [ ] Pasted both into `.env.local` (no spaces, no quotes)
- [ ] Saved file (Ctrl+S)
- [ ] Stopped dev server (Ctrl+C)
- [ ] Started dev server (`npm run dev`)
- [ ] Ran `node check-env.js` to verify
- [ ] Visited http://localhost:3000/api/test-supabase

---

**Once you see the success message, you're ready to build! 🚀**

