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
    const { idea, answers } = body as {
      idea?: unknown;
      answers?: unknown;
    };

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "idea" field' },
        { status: 400 }
      );
    }

    // Answers should be an object, default to empty if not provided
    const answerMap: Record<string, string> = 
      answers && typeof answers === 'object' && !Array.isArray(answers)
        ? answers as Record<string, string>
        : {};

    // Get OpenAI API key
    const apiKey = await getOpenAIKey();
    const openai = new OpenAI({ apiKey });

    // Build prompt with answers injected
    const prompt = `You are an expert setup coach.
User idea: "${idea}"
Answers: ${JSON.stringify(answerMap)}

Generate:
1. Top 5 Setup Wins – numbered, each with:
   - Title: WHAT the step accomplishes (e.g., "Initialize Your Project", "Set Up Database", "Configure Authentication")
   - Cursor prompt: Copy-paste ready Cursor prompt for this step
   - Terminal command: The exact command to run (if applicable)
   - Supabase tip: Explanation of WHAT the command does and WHY it's needed (if Supabase relevant)

IMPORTANT FOR STEP STRUCTURE:
- Title should describe the STEP'S PURPOSE, not the command itself
- Command should be the exact terminal command to run
- Supabase tip should explain what the command does and why it's needed
- Example: Title: "Initialize Your Project", Command: "npx create-next-app@latest", Tip: "Creates a new Next.js project with TypeScript and Tailwind CSS configured"

2. Kanban Board – Markdown table: To Do | In Progress | Done
   - Use clear, readable task names
   - Avoid special characters that might cause encoding issues

3. MVP Blueprint – Epics: Input, Output, Export, History
   - Use clear, concise epic descriptions
   - Avoid special characters

4. PDF-Ready JSON – with gradient color, user's app name, timestamp

Tone: Confident, beginner-friendly, zero fluff. Make user feel: "I can ship this TODAY."

Return ONLY valid JSON in this exact format:
{
  "top5": [
    {
      "title": "Step purpose (what it accomplishes)",
      "cursorPrompt": "Copy-paste ready Cursor prompt",
      "command": "npx create-next-app@latest",
      "supabaseTip": "Explanation of what the command does and why it's needed"
    }
  ],
  "kanbanMarkdown": "| To Do | In Progress | Done |\n|---|---|---|\n| Task 1 | Task 2 | Task 3 |",
  "blueprint": {
    "epics": {
      "input": ["Epic 1", "Epic 2"],
      "output": ["Epic 3"],
      "export": ["Epic 4"],
      "history": ["Epic 5"]
    }
  },
  "pdfMeta": {
    "appName": "Generated app name",
    "gradient": ["#3b82f6", "#8b5cf6"],
    "timestamp": "${new Date().toISOString()}"
  }
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Senior Setup Coach. Return ONLY JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    // Parse the response
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Validate structure
    if (!parsed.top5 || !parsed.kanbanMarkdown || !parsed.blueprint || !parsed.pdfMeta) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Build response with backward compatibility
    const out = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      idea,
      answers: answerMap,
      output: {
        top5: parsed.top5,
        kanbanMarkdown: parsed.kanbanMarkdown,
        blueprint: parsed.blueprint,
        pdfMeta: parsed.pdfMeta,
      },
      // Back-compat for existing UI
      steps: (parsed.top5 ?? []).map((t: any) => t.title || t),
      kanbanMarkdown: parsed.kanbanMarkdown,
      blueprint: parsed.blueprint,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(out);

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

