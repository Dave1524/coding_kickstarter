# 🎓 Beginner's Complete Setup Guide
## Coding Kickstarter - Your First Steps

---

## ✅ What You've Already Done

1. ✅ Installed Node.js (v22.20.0)
2. ✅ Installed npm (v10.9.3)
3. ✅ Created a Next.js project
4. ✅ Installed essential packages

---

## 📝 Terminal Commands You Should Know

### Navigation
```bash
# Move into a folder
cd folder_name

# Go back to parent folder
cd ..

# Go to home directory
cd ~

# See where you are
pwd

# List all files
dir          # Windows
ls           # Mac/Linux
```

### Project Management
```bash
# Install dependencies listed in package.json
npm install

# Add a new package
npm install package-name

# Remove a package
npm uninstall package-name

# Start development server
npm run dev

# Build project for production
npm run build

# Start production server
npm start
```

---

## 🔑 Step 1: Create Your `.env.local` File

**⚠️ IMPORTANT:** This file contains your secret keys. NEVER commit it to GitHub!

### How to create it:

1. **Open your project folder** in Cursor
2. **Right-click in the file explorer** (left sidebar)
3. **Select "New File"**
4. **Name it exactly:** `.env.local`
5. **Copy and paste this:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI API Keys
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** The `NEXT_PUBLIC_` prefix means these are visible to the browser. Don't put passwords or secret API keys with this prefix!

---

## 🌐 Step 2: Set Up Supabase (Backend Database)

### What is Supabase?
- **Free database in the cloud** to store user data, posts, etc.
- **Authentication system** for user login
- **Real-time updates** when data changes

### How to set it up:

1. **Go to** [supabase.com](https://supabase.com)
2. **Click "Sign Up"** (use Google or email)
3. **Create a new project:**
   - Give it a name (e.g., "Coding-Kickstarter")
   - Choose a region closest to you
   - Create a database password
   - Click "Create new project" (wait 1-2 minutes)
4. **Copy your credentials:**
   - Go to **Settings → API**
   - Copy **Project URL**
   - Copy **Anon Key** (public key, safe to share)
5. **Paste into `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

---

## 🤖 Step 3: Set Up OpenAI API (AI Integration)

### What is OpenAI?
- **ChatGPT's company** that provides API access
- **Pay-as-you-go** (often starts with free credits)
- **Use it to add AI features** to your app

### How to set it up:

1. **Go to** [platform.openai.com](https://platform.openai.com)
2. **Sign up** (use email or Google)
3. **Go to Settings → API Keys**
4. **Click "Create new secret key"**
5. **Copy immediately** (you can't see it again!)
6. **Paste into `.env.local`:**
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xxxxx
   ```

---

## 🚀 Step 4: Start Your Development Server

### In your terminal:
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.0.0
  - Ready in 2.3s
  ▲ Local:        http://localhost:3000
```

### Open in your browser:
- Type in address bar: `http://localhost:3000`
- You should see your Next.js app! 🎉

---

## 📂 File Structure Explained

```
coding_kickstarter/
├── app/
│   ├── page.tsx          # Your home page (edit this!)
│   ├── layout.tsx        # Shared layout for all pages
│   └── globals.css       # Global styles
├── lib/
│   ├── supabase.ts       # Database functions
│   └── api.ts            # AI API functions
├── public/               # Images, fonts (keep here)
├── .env.local            # 🔒 YOUR SECRETS (never commit!)
├── .gitignore            # What NOT to commit
├── package.json          # Your project info & dependencies
├── tsconfig.json         # TypeScript settings
└── next.config.ts        # Next.js settings
```

---

## 💾 First Edit: Customize Your Home Page

1. **Open** `app/page.tsx`
2. **Replace it with this simple starter:**

```typescript
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">🚀 Coding Kickstarter</h1>
        <p className="text-xl mb-8">Your AI-powered learning platform</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100">
          Get Started
        </button>
      </div>
    </main>
  );
}
```

3. **Save** (Ctrl+S)
4. **Check** http://localhost:3000 - it updates automatically!

---

## 🆘 Troubleshooting

### "Command not found: npm"
- Node.js isn't installed properly
- Restart your terminal
- Run: `node --version`

### Port 3000 already in use
- Another app is using it
- Run: `npm run dev -- -p 3001` (use port 3001 instead)

### `.env.local` not working
- Make sure file name is exactly `.env.local`
- Make sure you saved it
- Restart: `npm run dev`

### "Cannot find module @supabase/supabase-js"
- Run: `npm install`

---

## 🎯 Cursor Extensions You Should Install

### In Cursor, go to: **Extensions** (Ctrl+Shift+X)

1. **ES7+ React/Redux/React-Native snippets**
   - Faster typing with autocomplete

2. **Tailwind CSS IntelliSense**
   - Shows CSS classes as you type

3. **Prettier - Code formatter**
   - Auto-formats your code (right-click → Format Document)

4. **Thunder Client** or **REST Client**
   - Test your APIs without leaving Cursor

5. **TypeScript Vue Plugin (Volar)**
   - Better TypeScript support

---

## 📚 Next Steps

1. ✅ Get your `.env.local` file set up
2. ✅ Create Supabase & OpenAI accounts
3. ✅ Start `npm run dev`
4. ✅ Edit `app/page.tsx`
5. 🎯 Follow tutorials at [nextjs.org/learn](https://nextjs.org/learn)

---

## 🔗 Helpful Resources

- **Next.js Official Tutorial:** https://nextjs.org/learn
- **Supabase Getting Started:** https://supabase.com/docs/getting-started
- **Tailwind CSS Guide:** https://tailwindcss.com/docs
- **OpenAI API Docs:** https://platform.openai.com/docs

---

## ❓ Common Questions

**Q: Is my `.env.local` secure?**
A: Yes! It's in `.gitignore` so it won't be committed. But NEVER push it to GitHub!

**Q: Can I use free tier APIs?**
A: Supabase has a free tier. OpenAI gives free credits on signup. Keep an eye on usage!

**Q: How do I deploy this later?**
A: Use Vercel (made by Next.js creators) - it's free and super easy!

**Q: What if I make a mistake?**
A: That's how you learn! Break things, fix them, repeat. 🎓

---

Good luck! You've got this! 🚀
