import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get environment variables (Edge runtime compatible)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      );
    }

    // Use service role key if available, otherwise fall back to anon key
    const key = serviceRoleKey || anonKey;
    
    if (!key) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase API key' },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Upsert email (insert or update if exists)
    const { data, error } = await supabase
      .from('early_access_emails')
      .upsert(
        {
          email: email.trim().toLowerCase(),
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
      return NextResponse.json(
        { error: 'Failed to save email' },
        { status: 500 }
      );
    }

    if (!data || !data.id) {
      return NextResponse.json(
        { error: 'No ID returned from database' },
        { status: 500 }
      );
    }

    // Return success with the ID
    return NextResponse.json(
      { id: data.id },
      { status: 201 }
    );

  } catch (err) {
    console.error('Early access signup error:', err);

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

