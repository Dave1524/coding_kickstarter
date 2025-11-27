/**
 * GitHub OAuth API routes
 * Handles OAuth authorization flow for GitHub integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getGitHubOAuthUrl, validateToken } from '@/lib/github';
import { cookies } from 'next/headers';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Cookie settings
const GITHUB_TOKEN_COOKIE = 'github_token';
const OAUTH_STATE_COOKIE = 'github_oauth_state';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24, // 24 hours
  path: '/',
};

/**
 * GET /api/auth/github
 * Initiates OAuth flow or handles callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth callback
  if (code || error) {
    return handleCallback(code, state, error);
  }

  // Initiate OAuth flow
  return initiateOAuth();
}

/**
 * POST /api/auth/github
 * Check if user has valid GitHub token
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(GITHUB_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        error: 'No GitHub token found',
      });
    }

    const { valid, username, error } = await validateToken(token);

    if (!valid) {
      // Clear invalid token
      cookieStore.delete(GITHUB_TOKEN_COOKIE);
      return NextResponse.json({
        authenticated: false,
        error: error || 'Invalid token',
      });
    }

    return NextResponse.json({
      authenticated: true,
      username,
    });
  } catch (error) {
    console.error('GitHub auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Failed to check authentication' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/github
 * Logout - remove GitHub token
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(GITHUB_TOKEN_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GitHub logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

/**
 * Initiate the OAuth flow
 */
async function initiateOAuth(): Promise<NextResponse> {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: 'GitHub OAuth is not configured' },
      { status: 500 }
    );
  }

  // Generate random state for CSRF protection
  const state = generateState();
  const redirectUri = `${APP_URL}/api/auth/github`;
  const authUrl = getGitHubOAuthUrl(GITHUB_CLIENT_ID, redirectUri, state);

  // Store state in cookie for verification
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 10, // 10 minutes
  });

  return NextResponse.redirect(authUrl);
}

/**
 * Handle OAuth callback
 */
async function handleCallback(
  code: string | null,
  state: string | null,
  error: string | null
): Promise<NextResponse> {
  const redirectUrl = new URL('/', APP_URL);

  // Handle errors from GitHub
  if (error) {
    redirectUrl.searchParams.set('github_error', error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set('github_error', 'no_code');
    return NextResponse.redirect(redirectUrl);
  }

  // Verify state to prevent CSRF
  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!state || state !== storedState) {
    redirectUrl.searchParams.set('github_error', 'invalid_state');
    return NextResponse.redirect(redirectUrl);
  }

  // Clear state cookie
  cookieStore.delete(OAUTH_STATE_COOKIE);

  try {
    // Exchange code for token
    const { accessToken } = await exchangeCodeForToken(
      code,
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET
    );

    // Store token in cookie
    cookieStore.set(GITHUB_TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);

    // Redirect back to app with success
    redirectUrl.searchParams.set('github_connected', 'true');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    redirectUrl.searchParams.set('github_error', 'token_exchange_failed');
    return NextResponse.redirect(redirectUrl);
  }
}

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

