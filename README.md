# 🚀 Coding Kickstarter

A webapp for beginner coders to kickstart their journey with AI-generated coding prompts and setup guides. Fun, creative, and beginner-friendly, it offers tailored ideas to practice coding in a relaxed "vibe" style.

**Built with:** Next.js 16, TypeScript, Tailwind CSS, Supabase, OpenAI/Grok API

---

## 🌟 Features

- **AI-Powered Setup Guides**: Generate beginner-friendly setup steps for any project idea
- **Vibe Coding Mode**: Encourages creative, stress-free coding sessions
- **MVP Output**: Get structured MVP blueprints with EPICs and Features
- **PDF Export**: Download setup guides and plans
- **Beginner-Friendly**: Simple, intuitive UI for new developers

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ (v22.20.0 tested)
- npm v10+
- Supabase account (free tier works!)
- OpenAI or Grok API key

### Quick Setup

1. **Clone and install:**
```bash
git clone https://github.com/Dave1524/coding_kickstarter.git
cd coding_kickstarter
npm install
```

2. **Configure environment:**
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-proj-your-key
GROK_API_KEY=your-grok-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Start development:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Project Structure

```
coding_kickstarter/
├── app/
│   ├── page.tsx              # Home page (input form)
│   ├── output/page.tsx       # Results page (steps + kanban)
│   ├── api/
│   │   └── generate/route.ts # AI generation endpoint
│   └── layout.tsx
├── components/
│   ├── Form.tsx              # Input form component
│   ├── Steps.tsx             # Display setup steps
│   ├── Kanban.tsx            # Task board
│   └── PDFExport.tsx         # PDF export button
├── lib/
│   ├── supabaseClient.ts     # Supabase initialization
│   └── ai.ts                 # AI API calls
├── .env.local                # Your secrets (gitignored!)
└── package.json
```

---

## 🛠️ Development

**Available Commands:**
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Run production build
npm run lint      # Check code quality
npm run format    # Format code with Prettier
```

---

## 📖 Workflow

1. **Input**: User enters project idea (e.g., "Todo app for 100 users")
2. **AI Generation**: System asks 3-4 clarifying questions
3. **Output**: 
   - Top 5 setup steps
   - Kanban board with tasks
   - Scalability recommendations
   - PDF export option

---

## 🔐 Security

- ✅ API keys stored in `.env.local` (gitignored)
- ✅ Supabase RLS policies protect data
- ✅ Server-side API routes for sensitive operations
- ⚠️ Never commit `.env.local`!

---

## 🚀 Deployment

**Deploy to Vercel (recommended):**

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import this repository
4. Add environment variables in Vercel dashboard
5. Auto-deploys on `git push`!

---

## 📝 Sample Use Cases

- "Todo app for 100 users"
- "Chat app with real-time messaging"
- "E-commerce store with payments"
- "Weather app using public APIs"

---

## 🤝 Contributing

We love contributions! To contribute:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 💬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Dave1524/coding_kickstarter/issues)
- **Questions?** Reach out on GitHub or open a discussion!

---

**Happy coding! 🎉 Join us in making coding accessible to everyone.**
