import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { assertSupabaseEnv } from '@/utils/env';

/**
 * Create a Supabase client for server-side write operations.
 * REQUIRES service role key to bypass RLS.
 * 
 * DANGER: NEVER EXPOSE IN CLIENT
 * This function uses the service role key which has full database access.
 * Only use in server-side code (API routes, server components).
 */
export function createClient() {
  const { url, serviceRoleKey, anonKey } = assertSupabaseEnv(false); // Allow fallback to anon key

  // Prefer service role key, fall back to anon key if not available
  const key = serviceRoleKey || anonKey;
  
  if (!key) {
    throw new Error('Missing Supabase API key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)');
  }

  // Warn if using anon key for write operations (will hit RLS)
  if (!serviceRoleKey && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Using anon key for Supabase client. Write operations may fail due to RLS policies.');
    console.warn('💡 Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS for write operations.');
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create a Supabase client that REQUIRES service role key.
 * Use this for write operations that need to bypass RLS.
 * 
 * @throws Error if service role key is not available
 */
export function createServiceRoleClient() {
  const { url, serviceRoleKey } = assertSupabaseEnv(true); // Require service role key

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for write operations. ' +
      'Get it from: Supabase Dashboard → Settings → API → service_role key'
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create a Supabase client with anon key for read-only operations.
 * Use this when you need RLS policies to be enforced.
 */
export function createAnonClient() {
  const { url, anonKey } = assertSupabaseEnv(false);
  
  if (!anonKey) {
    throw new Error('Missing SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY for anon client');
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
