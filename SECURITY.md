# Security Documentation

This document outlines the security measures implemented in Coding Kickstarter and how to maintain them.

## Secrets Strategy

### Environment Variables

**Server-Only Secrets (NEVER expose to client):**
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access, bypasses RLS
- `OPENAI_API_KEY` - OpenAI API access
- `UPSTASH_REDIS_REST_URL` - Rate limiting Redis instance
- `UPSTASH_REDIS_REST_TOKEN` - Rate limiting Redis token

**Public/Client-Safe Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public, limited permissions)

### Key Rules

1. **NEVER** add `NEXT_PUBLIC_` prefix to service role keys or API keys
2. **NEVER** use `process.env` to access secrets in client components (`'use client'`)
3. **ALWAYS** use API routes (`/api/*`) as proxies for secret-needed operations
4. **ALWAYS** validate environment variables using `utils/env.ts` helpers

### Environment Variable Validation

All API routes use `utils/env.ts` helpers to validate required environment variables:

```typescript
import { assertOpenAIKey, assertSupabaseEnv } from '@/utils/env';

// Throws error if missing
const apiKey = assertOpenAIKey();
const { url, serviceRoleKey } = assertSupabaseEnv();
```

## Rate Limiting

### Implementation

Rate limiting is implemented using Upstash Redis and `@upstash/ratelimit`:

- **Endpoint**: `/api/generate`
- **Limit**: 5 requests per 60 seconds per IP
- **Method**: Sliding window algorithm
- **IP Detection**: Uses `X-Forwarded-For` header (Vercel-compatible)

### Configuration

Rate limiting is optional - if `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are not configured, rate limiting is disabled with a warning.

To enable:
1. Create a Redis instance at https://console.upstash.com/
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`
3. Restart the server

## Input Validation & Sanitization

### API Route Validation

All API routes validate inputs:

- **Idea length**: 6-499 characters
- **Email format**: Basic regex validation
- **Array types**: Type checking for questions, steps, etc.

### Output Sanitization

OpenAI responses are sanitized before returning to clients:

- Removes markdown code fences (```)
- Strips `<script>` tags
- Removes `javascript:` protocol handlers
- Trims whitespace

## Supabase Security

### Row Level Security (RLS)

RLS is enabled on the `generated_sprints` table with the following policies:

1. **Anonymous Insert**: Allows anonymous users to insert sprints
2. **Anonymous Select**: Allows anonymous users to read all sprints (public data)
3. **Service Role Full Access**: Service role key bypasses RLS automatically
4. **Authenticated Update/Delete**: Future auth support for users to manage their own sprints

### Service Role Key Usage

The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is used in:
- `/api/save-sprint` - Inserts new sprints
- `/api/early-access` - Inserts email signups
- All write operations that need to bypass RLS

**Important**: The service role key is NEVER exposed to the client. It's only used in server-side API routes.

### Anonymous User IDs

When saving sprints without authentication, a UUID is generated server-side:

```typescript
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

## Content Security Policy (CSP)

Security headers are configured in `next.config.ts`:

- **Content-Security-Policy**: Restricts resource loading to same origin and trusted domains
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Disables camera, microphone, geolocation

## API Route Security

### All API Routes

1. **Environment Validation**: Check required env vars at route start
2. **Input Validation**: Validate and sanitize all inputs
3. **Error Handling**: Never expose sensitive error details to clients
4. **Response Sanitization**: Clean outputs before returning

### Write Endpoints

- `/api/save-sprint`: Uses service role key, validates payload, generates UUID
- `/api/early-access`: Uses service role key, validates email format

### Read Endpoints

- `/api/history`: Uses service role key (can be changed to anon key if RLS allows)

## Key Rotation

### Rotating Supabase Keys

1. Generate new keys in Supabase Dashboard → Settings → API
2. Update `.env.local` with new keys
3. Update Vercel environment variables
4. Restart application
5. Revoke old keys in Supabase Dashboard

### Rotating OpenAI Key

1. Generate new key in OpenAI Dashboard
2. Update `OPENAI_API_KEY` in `.env.local`
3. Update Vercel environment variables
4. Restart application
5. Revoke old key in OpenAI Dashboard

### Rotating Upstash Redis

1. Create new Redis instance in Upstash Console
2. Update `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Restart application
4. Delete old Redis instance (optional)

## Incident Response

### If a Secret is Exposed

1. **Immediately revoke the exposed key**:
   - Supabase: Dashboard → Settings → API → Revoke key
   - OpenAI: Dashboard → API Keys → Revoke key
   - Upstash: Console → Delete instance

2. **Generate new keys** and update environment variables

3. **Redeploy application**:
   ```bash
   # Update .env.local
   # Push to Vercel (or redeploy)
   vercel --prod
   ```

4. **Audit logs**:
   - Check Supabase logs for unauthorized access
   - Check OpenAI usage for unexpected API calls
   - Review application logs for suspicious activity

5. **Notify affected users** if personal data was exposed

### Security Audit Checklist

- [ ] All secrets use server-only environment variables
- [ ] No `NEXT_PUBLIC_` prefix on sensitive keys
- [ ] RLS policies are enabled and tested
- [ ] Rate limiting is configured and working
- [ ] Input validation is in place for all API routes
- [ ] Output sanitization removes dangerous content
- [ ] CSP headers are configured correctly
- [ ] Error messages don't expose sensitive information

## Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use environment variable validation** - Always use `utils/env.ts` helpers
3. **Validate all inputs** - Check types, lengths, formats
4. **Sanitize all outputs** - Remove dangerous content before returning
5. **Use service role key sparingly** - Only for write operations that need RLS bypass
6. **Monitor rate limits** - Check Upstash dashboard for abuse
7. **Review logs regularly** - Check Supabase and application logs
8. **Keep dependencies updated** - Run `npm audit` regularly

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to the repository maintainer
3. Include steps to reproduce the issue
4. Allow time for the issue to be addressed before public disclosure

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimit)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)










