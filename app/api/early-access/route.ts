import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server';

export const runtime = 'edge';

/**
 * Save an early access email signup
 * 
 * POST /api/early-access
 * Body: {
 *   email: string,
 *   idea?: string,
 *   source?: 'landing' | 'results'
 * }
 * Returns: { id: uuid } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, idea, source } = body as {
      email?: unknown;
      idea?: unknown;
      source?: unknown;
    };

    // Validate email
    if (typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing email field' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate idea length if provided
    if (idea && typeof idea === 'string') {
      const trimmedIdea = idea.trim();
      if (trimmedIdea.length > 500) {
        return NextResponse.json(
          { error: 'Idea must be 500 characters or less' },
          { status: 400 }
        );
      }
    }

    // Get Supabase client with service role key (bypasses RLS)
    const supabase = createServiceRoleClient();

    // Upsert email (insert or update if exists)
    const { data, error } = await supabase
      .from('early_access_emails')
      .upsert(
        {
          email: trimmedEmail.toLowerCase(),
          idea: typeof idea === 'string' ? idea.slice(0, 500) : null,
          source: typeof source === 'string' ? source : null,
        },
        {
          onConflict: 'email',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      
      // Provide helpful error message for RLS policy violations
      if (error.code === '42501') {
        return NextResponse.json(
          { 
            error: 'Database permission denied. SUPABASE_SERVICE_ROLE_KEY is required for write operations.',
            hint: 'Get your service role key from: Supabase Dashboard → Settings → API → service_role key. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your-key-here'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to save email', details: error.message },
        { status: 500 }
      );
    }

    if (!data || !data.id) {
      return NextResponse.json(
        { error: 'No ID returned from database' },
        { status: 500 }
      );
    }

    // Return success with ONLY the ID (never keys or sensitive data)
    return NextResponse.json(
      { id: data.id },
      { status: 201 }
    );

  } catch (err) {
    console.error('Early access signup error:', err);

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
      { error: message },
      { status: 500 }
    );
  }
}
