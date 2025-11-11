import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { assertOpenAIKey } from '@/utils/env';

/**
 * AI-Powered Readiness Checker
 * 
 * Determines if enough information has been gathered to generate the setup guide,
 * or if more questions are needed.
 * 
 * POST /api/check-readiness
 * Body: { idea: string, answers: Record<string, string>, questionsAsked: string[] }
 */

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables (server-only)
    const apiKey = assertOpenAIKey();

    // Parse request body
    const body = await request.json();
    const { idea, answers, questionsAsked, skippedQuestions, maxQuestionsRemaining } = body as {
      idea?: unknown;
      answers?: unknown;
      questionsAsked?: unknown;
      skippedQuestions?: unknown;
      maxQuestionsRemaining?: unknown;
    };

    if (!idea || typeof idea !== 'string' || !idea.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid "idea" field' },
        { status: 400 }
      );
    }

    // Validate input length
    const trimmedIdea = idea.trim();
    if (trimmedIdea.length < 6 || trimmedIdea.length > 499) {
      return NextResponse.json(
        { error: 'Idea must be between 6 and 499 characters' },
        { status: 400 }
      );
    }

    // Validate answers
    const answerMap: Record<string, string> = 
      answers && typeof answers === 'object' && !Array.isArray(answers)
        ? answers as Record<string, string>
        : {};

    // Validate questionsAsked
    const askedArray: string[] = 
      Array.isArray(questionsAsked) 
        ? questionsAsked.filter(q => typeof q === 'string')
        : [];

    const openai = new OpenAI({ apiKey });

    // Build prompt for readiness check
    const prompt = `You are an expert setup coach evaluating if you have enough information to create a detailed setup guide.

User's project idea: "${trimmedIdea}"

Questions asked and answers received:
${Object.entries(answerMap).map(([qId, answer]) => `- ${qId}: ${answer}`).join('\n')}

Total questions asked: ${askedArray.length}
${typeof maxQuestionsRemaining === 'number' ? `Maximum questions remaining: ${maxQuestionsRemaining}` : ''}

Determine if you have enough information to generate a comprehensive setup guide, or if 1-2 more clarifying questions would significantly improve the quality of the guide.

IMPORTANT: Do NOT suggest more questions if the total would exceed 7 questions. Only suggest additional questions if absolutely critical and within the limit.

Return ONLY valid JSON in this exact format:
{
  "readyToGenerate": true or false,
  "needsMoreQuestions": true or false,
  "nextQuestions": [] or [{"id": "...", "text": "...", "type": "text|select", "options": [...]}]
}

Rules:
- Set readyToGenerate to true if you have enough information (even if more questions could help)
- Set needsMoreQuestions to true only if critical information is missing
- If needsMoreQuestions is true, provide 1-2 additional questions in nextQuestions array
- Be practical - don't ask for perfection, just enough to create a useful guide`;

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
    if (typeof parsed.readyToGenerate !== 'boolean') {
      throw new Error('Invalid response structure - readyToGenerate must be boolean');
    }

    if (typeof parsed.needsMoreQuestions !== 'boolean') {
      throw new Error('Invalid response structure - needsMoreQuestions must be boolean');
    }

    // If more questions are needed, validate them
    if (parsed.needsMoreQuestions && parsed.nextQuestions) {
      if (!Array.isArray(parsed.nextQuestions)) {
        throw new Error('Invalid response structure - nextQuestions must be an array');
      }
      for (const q of parsed.nextQuestions) {
        if (!q.id || !q.text || !q.type) {
          throw new Error('Invalid question structure - missing required fields');
        }
        if (q.type === 'select' && (!q.options || !Array.isArray(q.options))) {
          throw new Error('Invalid question structure - select type requires options array');
        }
      }
    }

    return NextResponse.json({
      readyToGenerate: parsed.readyToGenerate,
      needsMoreQuestions: parsed.needsMoreQuestions || false,
      nextQuestions: parsed.nextQuestions || []
    });

  } catch (error) {
    console.error('Check Readiness API Error:', error);

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
        error: 'Failed to check readiness',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


