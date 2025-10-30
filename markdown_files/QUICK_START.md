# ⚡ QUICK START (30 Seconds)

## You Need These 3 Things

### 1️⃣ Supabase Account
```
Go to: supabase.com → Sign Up → Create Project
Copy: Project URL + Anon Key
```

### 2️⃣ OpenAI API Key
```
Go to: platform.openai.com → Sign Up
Settings → API Keys → Create Secret Key
Copy it (you won't see it again!)
```

### 3️⃣ Create `.env.local` File
```
Right-click in file explorer → New File → `.env.local`
Paste this:

NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_key_here
```

---

## Start Your App
```bash
npm run dev
```
Then open: http://localhost:3000

---

## Key Keyboard Shortcuts (Windows)

| Action | Shortcut |
|--------|----------|
| Save file | Ctrl+S |
| Open terminal | Ctrl+` |
| Find text | Ctrl+F |
| Format code | Shift+Alt+F |
| Go to line | Ctrl+G |
| Comment out line | Ctrl+/ |

---

## What Each Command Does

```bash
npm run dev      # Start coding (auto-updates on save)
npm run build    # Prepare for publishing
npm start        # Run published version
npm install      # Get dependencies you need
```

---

## Your First Component

Edit `app/page.tsx`:
```tsx
export default function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold">Hello World! 👋</h1>
    </div>
  );
}
```

Save & refresh browser = instant update! 🚀

---

## Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| "Module not found" | Run `npm install` |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| Changes not showing | Hard refresh: Ctrl+Shift+R |
| `.env` not working | Restart: `npm run dev` |

---

## Your Project's DNA 🧬

| File | What It Does |
|------|-------------|
| `app/page.tsx` | Your home page |
| `app/layout.tsx` | Header/footer for all pages |
| `.env.local` | Your secret keys 🔒 |
| `lib/supabase.ts` | Database code |
| `lib/api.ts` | AI code |
| `package.json` | Your project's shopping list |

---

**📖 Read:** `SETUP_GUIDE.md` for detailed steps
