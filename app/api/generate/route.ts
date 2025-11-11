import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { assertOpenAIKey } from '@/utils/env';

/**
 * AI-Powered Setup Guide Generator
 * 
 * Takes a user's project idea and generates:
 * - 3-4 clarifying questions
 * - Top 5 setup steps (with terminal commands)
 * - Kanban board markdown
 * 
 * POST /api/generate
 * Body: { idea: string, answers?: Record<string, string> }
 */

// Initialize rate limiter (5 requests per 60 seconds per IP)
// Rate limiting is optional - only enabled if Upstash Redis is configured
let ratelimit: any = null;
try {
  // Dynamic import to avoid build errors if packages aren't installed
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Ratelimit } = require('@upstash/ratelimit');
    const { Redis } = require('@upstash/redis');
    const redis = Redis.fromEnv();
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
    });
  }
} catch (error) {
  console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not configured');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (if configured)
    if (ratelimit) {
      // Get client IP from headers (respects X-Forwarded-For for Vercel)
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'anonymous';
      
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait before making another request.' },
          { status: 429 }
        );
      }
    }

    // Validate environment variables (server-only)
    const apiKey = assertOpenAIKey();

    // Parse request body
    const body = await request.json();
    const { idea, answers } = body as {
      idea?: unknown;
      answers?: unknown;
    };

    // Validate input: idea length between 6 and 499 characters
    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "idea" field' },
        { status: 400 }
      );
    }

    const trimmedIdea = idea.trim();
    if (trimmedIdea.length < 6 || trimmedIdea.length > 499) {
      return NextResponse.json(
        { error: 'Idea must be between 6 and 499 characters' },
        { status: 400 }
      );
    }

    // Answers should be an object, default to empty if not provided
    const answerMap: Record<string, string> = 
      answers && typeof answers === 'object' && !Array.isArray(answers)
        ? answers as Record<string, string>
        : {};

    // Sanitize answers
    const sanitizedAnswers: Record<string, string> = {};
    for (const [key, value] of Object.entries(answerMap)) {
      if (typeof value === 'string') {
        // Remove markdown code fences and script tags
        sanitizedAnswers[key] = value
          .replace(/```[\s\S]*?```/g, '')
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .trim();
      }
    }

    const openai = new OpenAI({ apiKey });

    // Build prompt with sanitized answers
    const prompt = `You are an expert setup coach.
User idea: "${trimmedIdea}"
Answers: ${JSON.stringify(sanitizedAnswers)}

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

    // Sanitize OpenAI output: strip markdown code fences and script tags
    const sanitizeOutput = (text: string): string => {
      return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    };

    // Sanitize all string fields in the response
    if (parsed.kanbanMarkdown && typeof parsed.kanbanMarkdown === 'string') {
      parsed.kanbanMarkdown = sanitizeOutput(parsed.kanbanMarkdown);
    }
    if (Array.isArray(parsed.top5)) {
      parsed.top5 = parsed.top5.map((step: any) => ({
        ...step,
        title: typeof step.title === 'string' ? sanitizeOutput(step.title) : step.title,
        cursorPrompt: typeof step.cursorPrompt === 'string' ? sanitizeOutput(step.cursorPrompt) : step.cursorPrompt,
        command: typeof step.command === 'string' ? sanitizeOutput(step.command) : step.command,
        supabaseTip: typeof step.supabaseTip === 'string' ? sanitizeOutput(step.supabaseTip) : step.supabaseTip,
      }));
    }

    // Build response with backward compatibility
    const out = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      idea: trimmedIdea,
      answers: sanitizedAnswers,
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
          hint: 'Add OPENAI_API_KEY to your server environment variables (.env.local for local dev)'
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

