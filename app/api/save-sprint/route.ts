import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server';

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

    // Validate idea length
    const trimmedIdea = idea.trim();
    if (trimmedIdea.length < 6 || trimmedIdea.length > 499) {
      return NextResponse.json(
        { success: false, error: 'Idea must be between 6 and 499 characters' },
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

    // Get Supabase client with service role key (bypasses RLS)
    const supabase = createServiceRoleClient();

    // Insert into generated_sprints table
    // Note: user_id is set to null for anonymous users (no auth required)
    const { data, error } = await supabase
      .from('generated_sprints')
      .insert({
        idea: trimmedIdea,
        questions,
        top_steps,
        blueprint: normalizedBlueprint,
        user_id: null, // Anonymous - no user auth required
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      
      // Provide helpful error message for foreign key violations
      if (error.code === '23503') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Database constraint violation. The user_id column has a foreign key constraint.',
            hint: 'Run this SQL in Supabase SQL Editor to fix: ALTER TABLE generated_sprints ALTER COLUMN user_id DROP NOT NULL; ALTER TABLE generated_sprints DROP CONSTRAINT IF EXISTS generated_sprints_user_id_fkey;'
          },
          { status: 500 }
        );
      }
      
      // Provide helpful error message for RLS policy violations
      if (error.code === '42501') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Database permission denied. SUPABASE_SERVICE_ROLE_KEY is required for write operations.',
            hint: 'Get your service role key from: Supabase Dashboard → Settings → API → service_role key. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your-key-here'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to save sprint to database', details: error.message },
        { status: 500 }
      );
    }

    if (!data || !data.id) {
      return NextResponse.json(
        { success: false, error: 'No ID returned from database' },
        { status: 500 }
      );
    }

    // Return success with ONLY the sprint ID (never keys or sensitive data)
    return NextResponse.json({
      success: true,
      id: data.id,
    }, { status: 201 });

  } catch (err) {
    console.error('Save sprint error:', err);

    // Provide helpful error message if service role key is missing
    if (err instanceof Error && err.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      // Debug: Show what env vars are available (dev only)
      const debugInfo = process.env.NODE_ENV === 'development' ? {
        hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasServiceRoleKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY),
        hasAnonKey: !!(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
      } : undefined;

      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error',
          details: err.message,
          hint: 'Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file and restart the dev server. Get it from Supabase Dashboard → Settings → API → service_role key',
          debug: debugInfo,
        },
        { status: 500 }
      );
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
