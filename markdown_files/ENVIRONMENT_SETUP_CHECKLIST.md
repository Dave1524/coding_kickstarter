# ✅ Environment Setup Checklist

## System Requirements ✓

- [x] **Node.js v22.20.0** - Installed! ✅
- [x] **npm v10.9.3** - Installed! ✅
- [x] **Windows PowerShell** - Ready to go! ✅

---

## Project Installation ✓

- [x] **Next.js 16** - Installed ✅
- [x] **TypeScript** - Installed ✅
- [x] **Tailwind CSS** - Installed ✅
- [x] **Supabase Client** - Installed ✅
- [x] **Axios (HTTP Library)** - Installed ✅
- [x] **ESLint (Code Checker)** - Installed ✅

---

## 📋 Setup Steps (Do These Next!)

### STEP 1: Set Up Environment Variables
- [ ] Create `.env.local` file in project root
- [ ] Add Supabase URL
- [ ] Add Supabase API Key
- [ ] Add OpenAI API Key

**How to create:**
```
Right-click on file explorer (left side)
→ New File
→ Name it: .env.local
→ Copy the template from SETUP_GUIDE.md
```

### STEP 2: Get Supabase Account
- [ ] Go to https://supabase.com
- [ ] Click "Sign Up"
- [ ] Create account (use Google or email)
- [ ] Create a new project
- [ ] Copy Project URL
- [ ] Copy Anon Key
- [ ] Paste into `.env.local`

**⏱️ Time: ~5 minutes**

### STEP 3: Get OpenAI API Key
- [ ] Go to https://platform.openai.com
- [ ] Sign up
- [ ] Navigate to Settings → API Keys
- [ ] Click "Create new secret key"
- [ ] Copy it immediately (you won't see it again!)
- [ ] Paste into `.env.local`

**⏱️ Time: ~3 minutes**
**💰 Cost: Free to start (you get trial credits)**

### STEP 4: Start Development
- [ ] Open terminal (Ctrl+` in Cursor)
- [ ] Type: `npm run dev`
- [ ] Open http://localhost:3000 in browser
- [ ] See your app running! 🎉

### STEP 5: Install Cursor Extensions
- [ ] Press Ctrl+Shift+X (Extensions panel)
- [ ] Install "Tailwind CSS IntelliSense"
- [ ] Install "ES7+ React/Redux Snippets"
- [ ] Install "Prettier - Code formatter"
- [ ] Install "REST Client"
- [ ] Reload Cursor

---

## 📂 Your Project Structure

```
coding_kickstarter/
✓ READY TO USE:

├── 📄 SETUP_GUIDE.md ← Read this first!
├── 📄 QUICK_START.md ← 30-second summary
├── 📄 CURSOR_TIPS.md ← Cursor IDE guide
├── 📄 README.md ← Project overview

📁 Main Files (edit these!):
├── app/
│   ├── page.tsx ← Your home page
│   ├── layout.tsx ← Shared header/footer
│   └── globals.css ← Global styles
│
├── lib/
│   ├── supabase.ts ← Database functions (READY)
│   └── api.ts ← AI integration (READY)
│
├── public/ ← Images and fonts

🔒 Security:
├── .env.local ← YOUR SECRETS (you create this)
├── .gitignore ← Protects your secrets
└── .env.example ← Template for .env.local

⚙️ Configuration:
├── package.json ← Your dependencies
├── tsconfig.json ← TypeScript settings
├── tailwind.config.js ← Tailwind settings
└── next.config.ts ← Next.js settings
```

---

## 🚀 Your First Commands

### Terminal Basics
```bash
# See where you are
pwd

# Move into project folder
cd coding_kickstarter

# List files
dir                 # Windows
ls                  # Mac/Linux

# Start development
npm run dev

# Stop development
Ctrl+C              # Hold Ctrl, press C

# Install new packages
npm install package-name

# Remove packages
npm uninstall package-name
```

---

## 📱 Testing Your Setup

### Test 1: Is npm working?
```bash
npm --version
# Should show: 10.9.3 or higher
```

### Test 2: Can you start your app?
```bash
npm run dev
# Should show "Ready in X.X seconds"
# Should show "Local: http://localhost:3000"
```

### Test 3: Does your browser work?
```
Open: http://localhost:3000
You should see your Next.js page
```

---

## 🔑 API Keys Explained

### What's a `.env.local` file?
- Contains your SECRET API keys
- **NEVER** push to GitHub
- **NEVER** share publicly
- Local-only (your computer only)
- Each developer needs their own

### Why environment variables?
```
❌ WRONG (puts key in code):
const apiKey = "sk-1234567890"

✅ RIGHT (loads from .env.local):
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
```

### Understanding the prefixes:
```
NEXT_PUBLIC_* = Visible to browser (safe to use in frontend)
(no prefix) = Secret, only for server (backend functions)
```

---

## 🆘 Troubleshooting

### ❌ "npm command not found"
```
Solution:
1. Install Node.js from nodejs.org
2. Restart PowerShell
3. Run: node --version
4. If still broken, restart computer
```

### ❌ "Cannot find module"
```
Solution:
1. Run: npm install
2. If that doesn't work:
   - Delete node_modules/ folder
   - Delete package-lock.json file
   - Run: npm install again
```

### ❌ "Port 3000 already in use"
```
Solution 1:
npm run dev -- -p 3001
(uses port 3001 instead)

Solution 2:
Find what's using port 3000 and close it
```

### ❌ ".env.local not working"
```
Solution:
1. Make sure filename is EXACTLY: .env.local
2. Make sure you saved it (Ctrl+S)
3. Restart: npm run dev
4. In code, use: process.env.NEXT_PUBLIC_YOUR_KEY
```

### ❌ Changes not showing in browser
```
Solution:
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Restart: npm run dev
4. Close browser tab, reopen
```

---

## 📚 What You Just Installed

### Next.js (v16)
- **React framework** for web apps
- Auto-updating server
- File-based routing (folders = URLs)

### TypeScript (v5)
- **JavaScript with safety features**
- Catches errors before running
- Better code suggestions

### Tailwind CSS (v4)
- **CSS utility classes**
- Build styles without writing CSS
- Beautiful, responsive design fast

### Supabase
- **Backend database in cloud**
- PostgreSQL database
- User authentication
- Real-time updates

### Axios
- **Simple HTTP requests**
- Call APIs easily
- Handle responses

---

## 🎓 Learning Path

```
Level 1 (This Week):
├── ✓ Run npm run dev
├── ✓ Edit app/page.tsx
├── ✓ Create simple components
└── ✓ Understand file structure

Level 2 (Next Week):
├── Add Supabase database tables
├── Fetch data from Supabase
├── Create user login page
└── Style with Tailwind

Level 3 (Week 3):
├── Call OpenAI API
├── Build AI chat feature
├── Connect frontend to backend
└── Deploy to production
```

---

## 💡 Pro Tips

1. **Save frequently** - Ctrl+S
2. **Read error messages** - They tell you what's wrong
3. **Google error messages** - Others probably had it too
4. **Use Cursor's AI** - Press Ctrl+K and ask questions
5. **Start small** - Add one feature at a time
6. **Don't memorize** - Use this guide as reference
7. **Have fun** - Breaking things teaches you!

---

## 📞 Help Resources

### Official Docs
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs
- OpenAI: https://platform.openai.com/docs

### Video Tutorials
- Search "Next.js tutorial for beginners"
- Search "Supabase + Next.js tutorial"

### Community
- GitHub Issues
- Stack Overflow
- Discord communities

---

## ✨ You're All Set!

**Next action:**
1. Create `.env.local` file
2. Get Supabase & OpenAI keys
3. Run `npm run dev`
4. Edit `app/page.tsx`
5. Start building! 🚀

---

**Questions?** Re-read the guides above or check GitHub/Stack Overflow with your error message.

**You've got this!** 💪
