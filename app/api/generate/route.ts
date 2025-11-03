import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

/**
 * AI-Powered Setup Guide Generator
 * 
 * Takes a user's project idea and generates:
 * - 3-4 clarifying questions
 * - Top 5 setup steps (with terminal commands)
 * - Kanban board markdown
 * 
 * POST /api/generate
 * Body: { idea: string }
 */

// Helper: Get OpenAI API key from env or Supabase
async function getOpenAIKey(): Promise<string> {
  // Try env variable first (fastest)
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }

  // Fallback: fetch from Supabase secrets table (if service role key exists)
  // Check both possible env var names (with and without NEXT_PUBLIC_)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey
      );

      const { data, error } = await supabase
        .from('secrets')
        .select('api_key')
        .eq('provider', 'openai')
        .single();

      if (!error && data?.api_key) {
        return data.api_key;
      }
    } catch (err) {
      console.warn('Failed to fetch OpenAI key from Supabase:', err);
    }
  }

  throw new Error('OPENAI_API_KEY not found in environment or Supabase');
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { idea } = body;

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "idea" field' },
        { status: 400 }
      );
    }

    // Get OpenAI API key
    const apiKey = await getOpenAIKey();
    const openai = new OpenAI({ apiKey });

    // Craft the prompt for structured output
    const prompt = `You are a helpful coding mentor for complete beginners building "${idea}".

Generate a beginner-friendly setup guide with:
1. 3-4 clarifying questions to ask the user (e.g., "Need user authentication?", "Expected scale?")
2. Top 5 setup steps with actual terminal commands (e.g., "1. Create GitHub repo: git init")
3. A Kanban board in markdown format with 3 columns: To Do, In Progress, Done

IMPORTANT: Return ONLY valid JSON in this exact format (no extra text):
{
  "questions": ["Question 1?", "Question 2?", "Question 3?"],
  "steps": [
    "1. Step with command: \`npm install\`",
    "2. Another step with details",
    "3. Setup Supabase: Visit dashboard.supabase.com",
    "4. Configure environment: Create .env.local file",
    "5. Deploy to Vercel: \`vercel deploy\`"
  ],
  "kanbanMarkdown": "### 📋 To Do\\n- [ ] Setup GitHub repo\\n- [ ] Install dependencies\\n\\n### 🔄 In Progress\\n- [ ] Configure Supabase\\n\\n### ✅ Done\\n- [x] Read this guide"
}

Make it fun, beginner-friendly, and actionable. Include scalability tips (e.g., "Use Supabase RLS for 100+ users"). Use emojis to match the "vibe" style.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and affordable for planning
      messages: [
        {
          role: 'system',
          content: 'You are a coding mentor who helps beginners kickstart projects with clear, fun, actionable steps. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' } // Force JSON output
    });

    // Parse the response
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Validate structure
    if (!parsed.questions || !parsed.steps || !parsed.kanbanMarkdown) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Return structured response
    return NextResponse.json({
      provider: 'openai',
      model: 'gpt-4o-mini',
      idea,
      questions: parsed.questions,
      steps: parsed.steps,
      kanbanMarkdown: parsed.kanbanMarkdown,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generate API Error:', error);

    // Return helpful error message
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured',
          hint: 'Add OPENAI_API_KEY to your .env.local file and restart the server'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate setup guide',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

