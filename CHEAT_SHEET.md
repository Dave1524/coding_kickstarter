# 📋 Developer Cheat Sheet

Print this or keep it open while coding! 🚀

---

## 🎮 Terminal Commands (Copy & Paste)

```bash
# Start your app (your new best friend!)
npm run dev

# Stop your app
Ctrl+C

# Install packages
npm install package-name

# Remove packages
npm uninstall package-name

# Build for production
npm run build

# Run production version
npm start

# Check for errors
npm run lint

# See what's where
pwd                 # Where am I?
ls                  # What files are here? (Mac/Linux)
dir                 # What files are here? (Windows)
cd folder_name      # Go into folder
cd ..               # Go up one level
```

---

## ⌨️ Keyboard Shortcuts (Windows)

| Need | Press |
|------|-------|
| Open terminal | Ctrl+` |
| Save file | Ctrl+S |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Find text | Ctrl+F |
| Replace text | Ctrl+H |
| Go to line | Ctrl+G |
| Format code | Shift+Alt+F |
| Comment line | Ctrl+/ |
| Delete line | Ctrl+Shift+K |
| Copy line | Ctrl+C |
| Cut line | Ctrl+X |
| Find file | Ctrl+P |
| Run all commands | Ctrl+Shift+P |

---

## 🔑 Environment Variables Template

**Create `.env.local` with this:**

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# AI
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Important:**
- Never commit `.env.local` to GitHub!
- Never share these keys!
- Each developer needs their own

---

## 📁 File Structure Quick Ref

```
coding_kickstarter/
├── app/                    # Website pages
│   ├── page.tsx           # Home page (http://localhost:3000)
│   ├── layout.tsx         # Shared header/footer
│   └── globals.css        # Global styles
│
├── lib/                    # Helper functions
│   ├── supabase.ts        # Database helpers (READY!)
│   └── api.ts             # AI helpers (READY!)
│
├── components/             # Reusable components (create here)
│   └── Button.tsx
│
├── public/                 # Images, fonts
│
├── .env.local             # YOUR SECRETS (create this)
├── package.json           # Dependencies list
└── README.md              # Project info
```

---

## 🚀 File Types Explained

| File | What It Is | Example |
|------|-----------|---------|
| `.tsx` | React component | `<Button onClick={...} />` |
| `.ts` | Plain TypeScript | Functions, helpers |
| `.css` | Styling | `color: blue;` |
| `.json` | Data format | package.json |
| `.md` | Documentation | This file! |

---

## 🎨 Tailwind CSS Quick Classes

```tsx
// Spacing
p-4         // Padding
m-4         // Margin
mb-8        // Margin bottom

// Text
text-lg     // Large text
text-bold   // Bold
text-center // Center text
text-white  // White text

// Colors
bg-blue-500     // Blue background
text-red-600    // Red text
hover:bg-blue-700  // Hover effect

// Layout
flex            // Horizontal layout
grid            // Grid layout
gap-4           // Space between items
justify-center  // Center horizontally
items-center    // Center vertically

// Size
w-full          // Full width
h-screen        // Full screen height
max-w-lg        // Max width

// Visibility
hidden          // Hide element
opacity-50      // Semi-transparent

// Borders & Corners
border          // Add border
rounded-lg      // Rounded corners
shadow-lg       // Drop shadow
```

---

## 💻 Common Code Snippets

### Import from lib
```typescript
import { supabase } from '@/lib/supabase';
import { callOpenAI } from '@/lib/api';
```

### Use State (Remember 'use client'!)
```typescript
'use client';
import { useState } from 'react';

export default function MyComponent() {
  const [count, setCount] = useState(0);
  
  return <button onClick={() => setCount(count + 1)}>
    Clicked {count} times
  </button>;
}
```

### Fetch from Supabase
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

### Call AI
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Your question' })
});
```

### Create a Button
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Click Me!
</button>
```

---

## 🐛 Debug Like a Pro

### Check if npm works
```bash
npm --version
```
Should show: `10.9.3` (or higher)

### Check if Node works
```bash
node --version
```
Should show: `v22.20.0` (or higher)

### Check if your app starts
```bash
npm run dev
```
Look for: "✓ Ready in X.X seconds"

### See your app
Open browser: `http://localhost:3000`

---

## 🆘 Common Problems & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| "Command not found" | Restart terminal, check Node install |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Module not found | `npm install` |
| Changes not showing | Ctrl+Shift+R (hard refresh) |
| `.env` not working | Restart app, check spelling |
| TypeError | Read the error, usually tells you |

---

## 🔗 URL Patterns

```
http://localhost:3000          # Home page
http://localhost:3000/users    # From app/users/page.tsx
http://localhost:3000/api/chat # From app/api/chat/route.ts
```

---

## 📱 React Hooks (Common)

### useState
```typescript
const [count, setCount] = useState(0);
setCount(count + 1);
```

### useEffect
```typescript
useEffect(() => {
  // Run this code once on load
  fetchData();
}, []); // Empty array = run once
```

### useContext
```typescript
const value = useContext(MyContext);
```

---

## 🔒 Security Reminders

✅ DO:
- Use `.env.local` for secrets
- Keep API keys secret
- Never commit `.env.local`
- Validate user input

❌ DON'T:
- Put API keys in code
- Share `.env.local`
- Commit passwords
- Trust user input blindly

---

## 🌐 Browser DevTools (F12)

| Tab | What It Does |
|-----|-------------|
| Console | See errors & logs |
| Elements | See your HTML |
| Network | See API calls |
| Application | See stored data |

**Keyboard:** F12 to open

---

## 📚 Quick Links

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com
- **OpenAI API:** https://platform.openai.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

## 🎯 Your Daily Workflow

1. **Open Cursor** → Your project loads
2. **Ctrl+`** → Open terminal
3. **npm run dev** → Start coding
4. **Edit files** → See changes auto-update
5. **Ctrl+S** → Save frequently
6. **Check errors** → Bottom right corner
7. **Break stuff** → It's how you learn!
8. **Ctrl+C** → Stop when done

---

## 🎓 What You Just Learned

- ✅ Terminal basics (pwd, cd, ls, dir)
- ✅ npm commands (install, start, build)
- ✅ Cursor shortcuts (Ctrl+`, Ctrl+S, etc.)
- ✅ File structure (app, lib, components)
- ✅ Environment variables (.env.local)
- ✅ Common Tailwind classes
- ✅ React basics (useState, useEffect)

**That's more than half of what you need to know!** 🚀

---

## 💡 Remember

- **Every programmer** started exactly where you are
- **Errors are normal** - they guide you
- **Google is your friend** - copy-paste errors!
- **Cursor's AI helps** - Ctrl+K to ask
- **Persistence beats perfection** - keep going!
- **You've got this!** 💪

---

## 🎊 Keep This Handy!

Bookmark or print this page. You'll reference it constantly.

**Happy coding!** 🚀✨
