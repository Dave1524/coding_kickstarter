/**
 * AI Stack Inference API
 * Suggests optimal stack configuration based on project idea and requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StackSuggestion {
  database: 'supabase' | 'mongodb';
  payments: 'lemonsqueezy' | 'stripe';
  emails: 'resend' | 'mailgun';
  reasoning: {
    database: string;
    payments: string;
    emails: string;
  };
  confidence: number;
}

const SYSTEM_PROMPT = `You are a technical architect helping developers choose the best tech stack for their SaaS project.

Available options:
- Database: Supabase (PostgreSQL, real-time, auth built-in) or MongoDB (document store, flexible schema)
- Payments: Lemon Squeezy (simple, merchant of record, handles taxes) or Stripe (more control, more complex)
- Emails: Resend (modern, React Email support) or Mailgun (established, high volume)

Analyze the project idea and suggest the best stack. Consider:
- Real-time needs → Supabase
- Flexible/nested data → MongoDB
- Simple payments, global sales → Lemon Squeezy
- Complex payment flows, existing Stripe experience → Stripe
- Modern email templates → Resend
- High volume transactional → Mailgun

Respond in JSON format only:
{
  "database": "supabase" | "mongodb",
  "payments": "lemonsqueezy" | "stripe",
  "emails": "resend" | "mailgun",
  "reasoning": {
    "database": "Brief reason for database choice",
    "payments": "Brief reason for payments choice",
    "emails": "Brief reason for emails choice"
  },
  "confidence": 0.0-1.0
}`;

export async function POST(request: NextRequest) {
  try {
    const { idea, answers } = await request.json();

    if (!idea) {
      return NextResponse.json(
        { error: 'Project idea is required' },
        { status: 400 }
      );
    }

    // Build context from idea and answers
    let context = `Project Idea: ${idea}\n`;
    
    if (answers && Object.keys(answers).length > 0) {
      context += '\nAdditional Context:\n';
      for (const [question, answer] of Object.entries(answers)) {
        context += `- ${question}: ${answer}\n`;
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: context },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    const suggestion: StackSuggestion = JSON.parse(responseText);

    // Validate the response
    if (!isValidStackSuggestion(suggestion)) {
      throw new Error('Invalid stack suggestion format');
    }

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('Stack inference error:', error);

    // Return default stack on error
    return NextResponse.json({
      success: true,
      suggestion: {
        database: 'supabase',
        payments: 'lemonsqueezy',
        emails: 'resend',
        reasoning: {
          database: 'Supabase is the default choice - great for most SaaS apps with built-in auth and real-time.',
          payments: 'Lemon Squeezy simplifies global payments and handles taxes as merchant of record.',
          emails: 'Resend offers modern API and React Email support for beautiful transactional emails.',
        },
        confidence: 0.5,
      },
      fallback: true,
    });
  }
}

function isValidStackSuggestion(obj: unknown): obj is StackSuggestion {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const suggestion = obj as Record<string, unknown>;
  
  return (
    (suggestion.database === 'supabase' || suggestion.database === 'mongodb') &&
    (suggestion.payments === 'lemonsqueezy' || suggestion.payments === 'stripe') &&
    (suggestion.emails === 'resend' || suggestion.emails === 'mailgun') &&
    typeof suggestion.reasoning === 'object' &&
    typeof suggestion.confidence === 'number'
  );
}

