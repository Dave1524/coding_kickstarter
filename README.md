# 🚀 Coding Kickstarter

A modern Next.js application with Supabase backend and AI API integration.

## 📦 What's Installed?

- **Next.js 16** - React framework for web apps
- **TypeScript** - JavaScript with type safety
- **Tailwind CSS** - Beautiful styling
- **Supabase** - Backend database & auth
- **Axios** - HTTP requests for APIs

## 🔧 Setup Instructions

### 1. Prerequisites
- ✅ Node.js (v18+) - Already installed!
- ✅ npm (v9+) - Already installed!

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Configure Environment Variables
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and API key
3. Edit `.env.local` and paste your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 4. Set Up AI APIs
- Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
- Add to `.env.local`:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_key
```

## 📚 Basic File Structure

```
coding_kickstarter/
├── app/              # Main application code
│   ├── page.tsx      # Home page
│   └── layout.tsx    # Shared layout
├── lib/              # Helper functions
│   └── supabase.ts   # Database setup
├── public/           # Images, fonts
├── .env.local        # Your secrets (don't commit!)
└── package.json      # Your dependencies
```

## 📖 Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check for errors
npm run lint

# Format code
npm run format
```

## 🆘 Need Help?

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
