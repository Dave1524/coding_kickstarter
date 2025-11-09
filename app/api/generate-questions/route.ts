import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

/**
 * AI-Powered Question Generator
 * 
 * Generates 3-5 relevant clarifying questions based on the user's project idea.
 * 
 * POST /api/generate-questions
 * Body: { idea: string }
 */

// Helper: Get OpenAI API key from env or Supabase
async function getOpenAIKey(): Promise<string> {
  // Try env variable first (fastest)
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }

  // Fallback: fetch from Supabase secrets table (if service role key exists)
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
    const { idea } = body as { idea?: unknown };

    if (!idea || typeof idea !== 'string' || !idea.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid "idea" field' },
        { status: 400 }
      );
    }

    // Get OpenAI API key
    const apiKey = await getOpenAIKey();
    const openai = new OpenAI({ apiKey });

    // Build prompt for question generation
    const prompt = `You are an expert setup coach helping beginners build their first app.

User's project idea: "${idea.trim()}"

Generate 3-5 clarifying questions that will help you create a detailed setup guide. Focus on:
- User's technical level and experience
- Key features and functionality needed
- Data storage requirements (if any)
- Authentication needs (if any)
- Deployment preferences
- UI/UX expectations

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "unique_id_1",
      "text": "Question text here?",
      "type": "text",
      "placeholder": "Optional placeholder text"
    },
    {
      "id": "unique_id_2",
      "text": "Another question?",
      "type": "select",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ]
}

Rules:
- Use "text" type for open-ended questions
- Use "select" type when specific options would be helpful
- Keep questions concise and beginner-friendly
- Generate 3-5 questions total
- Make questions specific to the project idea`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Senior Setup Coach. Return ONLY valid JSON.'
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
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid response structure from OpenAI - questions array missing or empty');
    }

    // Validate each question has required fields
    for (const q of parsed.questions) {
      if (!q.id || !q.text || !q.type) {
        throw new Error('Invalid question structure - missing required fields');
      }
      if (q.type === 'select' && (!q.options || !Array.isArray(q.options))) {
        throw new Error('Invalid question structure - select type requires options array');
      }
    }

    return NextResponse.json({
      questions: parsed.questions,
      readyToGenerate: false // Will be checked later after answers
    });

  } catch (error) {
    console.error('Generate Questions API Error:', error);

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
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


