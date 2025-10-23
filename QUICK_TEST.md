# ⚡ Quick Test (3 Steps, 2 Minutes)

## You're Almost There! Just 3 Quick Steps:

---

### 1️⃣ Get OpenAI Key (1 minute)

Go to: **https://platform.openai.com/api-keys**

1. Sign up (free!)
2. Click "Create new secret key"
3. Copy it (starts with `sk-proj-...`)

---

### 2️⃣ Add to `.env.local` (30 seconds)

Open `.env.local` in Cursor and add this line:

```env
OPENAI_API_KEY=sk-proj-paste-your-key-here
```

Save (Ctrl+S)

---

### 3️⃣ Test It! (30 seconds)

In terminal:
```bash
# Stop server (Ctrl+C), then restart:
npm run dev
```

Open browser:
```
http://localhost:3000
```

Type: **"Todo app for 100 users"**

Click: **"✨ Generate Setup Guide"**

---

## ✅ Expected Result:

You should see:
- 🤔 3-4 clarifying questions
- 📝 5 actionable setup steps
- 📋 A Kanban board

---

## 🆘 Issues?

**"OpenAI API key not configured"**
→ Did you restart the server after adding the key?

**"Empty response"**
→ Check you have credits: https://platform.openai.com/usage

**Still stuck?**
→ Read: `TESTING_GUIDE.md` (detailed troubleshooting)

---

**That's it! You're ready to kickstart projects with AI!** 🚀

