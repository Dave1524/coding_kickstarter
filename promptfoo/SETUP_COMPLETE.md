# ✅ Promptfoo Setup Complete!

All necessary files have been created for testing your AI prompts. You're ready to run tests!

## 📁 Files Created

```
promptfoo/
├── promptfooconfig.yaml       # Main configuration file
├── prompts/
│   ├── questions.yaml         # Prompt for clarifying questions (matches /api/generate-questions)
│   └── setup-guide.yaml       # Prompt for setup guide generation (matches /api/generate)
├── README.md                  # Full documentation
├── QUICK_START.md            # Quick start guide
└── SETUP_COMPLETE.md         # This file
```

## 🚀 Quick Start (30 seconds)

1. **Make sure your OpenAI API key is set:**
   ```bash
   # Your .env.local already has OPENAI_API_KEY
   # Or export it:
   export OPENAI_API_KEY=sk-your-key-here
   ```

2. **Run the tests:**
   ```bash
   npx promptfoo@latest eval
   ```

3. **View results:**
   ```bash
   npx promptfoo@latest view
   ```

## ✨ What's Configured

### ✅ Clarifying Questions Testing
- **Prompt**: Matches your `/api/generate-questions` endpoint exactly
- **Model**: `gpt-4o-mini` (same as production)
- **Temperature**: `0.7` (same as production)
- **Test Cases**: 5 real-world project ideas:
  - Todo app with user login
  - Weather app for my city
  - Blog where I write articles
  - E-commerce store with payments
  - Chat app with real-time messaging

### ✅ Validation Assertions
Each test validates:
- ✅ **JSON Structure** - Matches your API format
- ✅ **Question Count** - 3-5 questions generated
- ✅ **Required Fields** - Each question has `id`, `text`, `type`
- ✅ **Select Questions** - Select questions have `options` array
- ✅ **Quality Check** - LLM rubric ensures beginner-friendly and relevant questions

## 📊 Expected Output

When you run `npx promptfoo@latest eval`, you should see:

```
✓ PASS  A todo app with user login
✓ PASS  Weather app for my city
✓ PASS  A blog where I write articles
✓ PASS  E-commerce store with payments
✓ PASS  Chat app with real-time messaging

5/5 tests passed
```

## 🔧 Next Steps

1. **Run the tests now:**
   ```bash
   cd promptfoo
   npx promptfoo@latest eval
   ```

2. **If tests pass**, you can:
   - Add more test cases to `promptfooconfig.yaml`
   - Test the setup guide generation prompt (`prompts/setup-guide.yaml`)
   - Compare different models (e.g., `gpt-4o` vs `gpt-4o-mini`)

3. **If tests fail**, check:
   - Your `OPENAI_API_KEY` is set correctly
   - The API responses match the expected JSON format
   - Use `npx promptfoo@latest view` to see detailed output

## 📚 Resources

- [Promptfoo Docs](https://www.promptfoo.dev/docs/getting-started/)
- [Configuration Guide](https://www.promptfoo.dev/docs/configuration/guide)
- [Assertions Reference](https://www.promptfoo.dev/docs/configuration/expected-outputs)

## 🎯 What This Tests

This setup tests the **exact same prompt** that your `/api/generate-questions` endpoint uses. If these tests pass, you can be confident that:
- ✅ Your prompt is working correctly
- ✅ The AI generates valid JSON
- ✅ Questions are relevant and beginner-friendly
- ✅ The format matches your API expectations

---

**You're all set!** Run `npx promptfoo@latest eval` to start testing! 🚀

