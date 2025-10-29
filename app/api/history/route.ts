import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Fetch all saved sprints from Supabase
 * 
 * GET /api/history
 * Returns: { sprints: array } or { error: string }
 */
export async function GET() {
  try {
    const supabase = createClient();

    // Fetch all sprints, ordered by most recent first
    const { data, error } = await supabase
      .from('generated_sprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sprints' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sprints: data || [] });

  } catch (err) {
    console.error('History API error:', err);

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
