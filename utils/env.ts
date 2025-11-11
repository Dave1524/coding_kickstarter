/**
 * Server-only environment variable validation
 * 
 * DANGER: NEVER EXPOSE IN CLIENT
 * These functions should only be used in server-side code (API routes, server components).
 * Client components must use API routes as proxies for any secret-needed operations.
 */

/**
 * Validates that required Supabase environment variables are present
 * @param requireServiceRole - If true, requires service role key. If false, allows fallback to anon key.
 * @throws Error if any required variable is missing
 */
export function assertSupabaseEnv(requireServiceRole: boolean = true): {
  url: string;
  serviceRoleKey?: string;
  anonKey?: string;
} {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Check both variants - some setups use NEXT_PUBLIC_ prefix (though not recommended for service role)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (requireServiceRole && !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'Checked: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY. ' +
      'Make sure it\'s in your .env.local file and restart the dev server.'
    );
  }

  if (!requireServiceRole && !serviceRoleKey && !anonKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable');
  }

  return {
    url,
    serviceRoleKey: serviceRoleKey || undefined,
    anonKey: anonKey || undefined,
  };
}

/**
 * Validates that OpenAI API key is present
 * @throws Error if OPENAI_API_KEY is missing
 */
export function assertOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
  return key;
}

/**
 * Validates that Upstash Redis environment variables are present (for rate limiting)
 * @throws Error if any required variable is missing
 */
export function assertUpstashRedis(): {
  url: string;
  token: string;
} {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL environment variable');
  }

  if (!token) {
    throw new Error('Missing UPSTASH_REDIS_REST_TOKEN environment variable');
  }

  return { url, token };
}

