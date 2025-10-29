import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for server-side operations.
 * Falls back to the anon key for read-only flows, but prefers the service
 * role key so we can insert rows even with RLS enabled.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const key = serviceRoleKey ?? anonKey;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
