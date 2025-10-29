import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

/**
 * Save a generated sprint to Supabase
 * 
 * POST /api/save-sprint
 * Body: {
 *   idea: string,
 *   questions: string[],
 *   top_steps: string[],
 *   blueprint?: {
 *     epics?: string[];
 *     kanbanMarkdown?: string;
 *   }
 * }
 * Returns: { success: true, id: uuid } or { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      idea,
      questions,
      top_steps,
      blueprint,
    } = body as {
      idea?: unknown;
      questions?: unknown;
      top_steps?: unknown;
      blueprint?: unknown;
    };

    // Validate inputs
    if (typeof idea !== 'string' || idea.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing idea field' },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.some((q) => typeof q !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing questions field' },
        { status: 400 }
      );
    }

    if (!Array.isArray(top_steps) || top_steps.some((s) => typeof s !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing top_steps field' },
        { status: 400 }
      );
    }

    const normalizedBlueprint = (() => {
      if (!blueprint || typeof blueprint !== 'object') {
        return {
          epics: [],
          kanbanMarkdown: '',
        };
      }

      const bp = blueprint as Record<string, unknown>;
      return {
        epics: Array.isArray(bp.epics) ? bp.epics.filter((item): item is string => typeof item === 'string') : [],
        kanbanMarkdown: typeof bp.kanbanMarkdown === 'string' ? bp.kanbanMarkdown : '',
      };
    })();

    // Get Supabase client
    const supabase = createClient();

    // Insert into generated_sprints table
    const { data, error } = await supabase
      .from('generated_sprints')
      .insert({
        idea: idea.trim(),
        questions,
        top_steps,
        blueprint: normalizedBlueprint,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save sprint to database' },
        { status: 500 }
      );
    }

    if (!data || !data.id) {
      return NextResponse.json(
        { success: false, error: 'No ID returned from database' },
        { status: 500 }
      );
    }

    // Return success with the inserted ID
    return NextResponse.json({
      success: true,
      id: data.id,
    }, { status: 201 });

  } catch (err) {
    console.error('Save sprint error:', err);

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
