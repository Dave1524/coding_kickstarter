# Coding Kickstarter - Promptfoo Regression Suite

**🚨 PRE-DEPLOY GATE: Run `npx promptfoo eval` before EVERY deploy. Must be 100% green.**

## Overview

This regression suite tests the complete end-to-end user flow for Coding Kickstarter:

1. ✅ User types idea → AI generates exactly 3-4 clarifying questions
2. ✅ User answers questions → AI generates final plan
3. ✅ Final plan contains exactly 5 numbered setup steps
4. ✅ At least 3 copy-pasteable terminal commands appear
5. ✅ Supabase tips appear when login/database is mentioned
6. ✅ PDF generation data is valid (gradient, app name, timestamp)
7. ✅ All responses complete in < 10 seconds

## Test Coverage

### 7 Realistic Test Cases

1. **Todo app with login** - Tests Supabase auth integration
2. **Blog with comments** - Tests content management and database
3. **Weather dashboard** - Tests API integration (no auth)
4. **Habit tracker** - Tests data persistence
5. **Recipe sharing app** - Tests user-generated content and ratings
6. **Simple landing page with form** - Tests basic form handling
7. **SaaS dashboard with Stripe** - Edge case: complex payment integration

### Hard Assertions

- ✅ Exactly 3-4 questions (not 5, not 2)
- ✅ Exactly 5 numbered steps in final output
- ✅ At least 3 terminal commands (npm/npx/yarn/git/supabase)
- ✅ Supabase tips when login/database mentioned
- ✅ Valid PDF metadata structure (gradient, appName, timestamp)
- ✅ Latency < 10 seconds per request

### Additional Integration Tests (Not in Promptfoo)

The following require actual API/database calls and should be tested separately:

- **History save returns UUID**: Test `POST /api/save-sprint` returns `{ success: true, id: "uuid" }`
- **PDF download works**: Test that PDF generation completes without errors
- **History page loads**: Test `GET /api/save-sprint` returns array of saved sprints

These can be tested with:
- Manual testing
- Playwright/Cypress E2E tests
- API integration tests (Jest/Supertest)

## Quick Start

### Option 1: Direct Run (Simplest - Recommended)

The `.env` file in the `promptfoo/` directory is already configured with your API key. Simply run:

```powershell
# From project root
npx promptfoo eval -c promptfoo/promptfooconfig.yaml

# View results in browser
npx promptfoo view
```

**Note:** Promptfoo automatically loads the `.env` file from the same directory as the config file, so no additional setup is needed!

### Option 2: Use the PowerShell Script

```powershell
# From project root, simply run:
.\run-promptfoo.ps1
```

This script automatically:
- Loads environment variables from `.env.local` (if you prefer that method)
- Verifies `OPENAI_API_KEY` is set
- Runs promptfoo with the correct config path

### Option 3: Manual Environment Variable Setup

```bash
# Install promptfoo (if not already installed)
npm install -g promptfoo

# Set environment variable (PowerShell)
$env:OPENAI_API_KEY = "sk-your-key-here"
npx promptfoo eval -c promptfoo/promptfooconfig.yaml

# Or load from .env.local
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $value = $value -replace '^["\']|["\']$', ''
        [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}
npx promptfoo eval -c promptfoo/promptfooconfig.yaml
```

## Pre-Deploy Checklist

**Before every deploy to production:**

1. ✅ Run `npx promptfoo eval`
2. ✅ Verify all tests pass (100% green)
3. ✅ Check latency tests (< 10s)
4. ✅ Review any failed assertions
5. ✅ Fix issues before deploying

## Test Structure

```
promptfoo/
├── promptfooconfig.yaml    # Main test configuration
├── prompts/
│   ├── questions.yaml      # Questions generation prompt
│   └── setup-guide.yaml    # Final plan generation prompt
└── README.md               # This file
```

## Understanding Test Results

### ✅ Passing Tests
- All assertions return `true`
- JSON structure is valid
- Response times are under threshold

### ❌ Failing Tests
- Check the assertion message for specific failure reason
- Common issues:
  - Wrong number of questions/steps
  - Missing required fields
  - Invalid JSON structure
  - Latency exceeded

## Multi-Turn Testing

The suite tests the complete conversation flow:

1. **Phase 1**: Generate questions from idea
2. **Phase 2**: Generate final plan from idea + answers

Each test case validates both phases independently.

## CI/CD Integration

Add to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Run Promptfoo Tests
  run: npx promptfoo eval
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## API Key Configuration

According to the [promptfoo OpenAI documentation](https://www.promptfoo.dev/docs/providers/openai/), the API key can be provided in three ways:

1. **`.env` file in promptfoo directory** ✅ (Currently configured)
   - File: `promptfoo/.env`
   - Format: `OPENAI_API_KEY=sk-...`
   - Auto-loaded by promptfoo when running from the config directory

2. **Environment variable**
   - Set `OPENAI_API_KEY` in your shell environment
   - Works system-wide or per-session

3. **Direct in config** (Not recommended for security)
   - Add `apiKey` field in `providers[].config`
   - Less secure as it's stored in version control

## Troubleshooting

### "API key is not set" error
- ✅ **Solution**: The `.env` file in `promptfoo/` directory should contain `OPENAI_API_KEY=sk-...`
- Verify the file exists: `Test-Path promptfoo\.env`
- Check the file content: `Get-Content promptfoo\.env`

### Tests failing with "Invalid JSON"
- Check that `response_format: { type: 'json_object' }` is set
- Verify model is `gpt-4o-mini` (JSON mode supported)

### Latency tests failing
- Check OpenAI API response times
- Verify network connectivity
- Consider rate limiting issues

### Missing Supabase tips
- Tests check for Supabase mentions when login/database is mentioned
- This is a soft assertion (preferred but not required)

## Maintenance

- Update test cases when adding new features
- Add new test cases for edge cases
- Keep prompts in sync with API routes (`app/api/generate/route.ts` and `app/api/generate-questions/route.ts`)

---

**Remember: 100% green before deploy. No exceptions.** 🚀
