# GitHub OAuth Setup Guide

This guide explains how to configure GitHub OAuth for the Coding Kickstarter boilerplate generation feature.

## Overview

The application uses GitHub OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication. This allows users to authorize the app to create repositories on their behalf.

## GitHub OAuth App Configuration

### Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: `coding_kickstarter_boilerplate` (or your preferred name)
   - **Homepage URL**: `https://codingkickstarter.com` (your production URL)
   - **Authorization callback URL**: This is important! Add both:
     - `http://localhost:3000/api/auth/github` (for local development)
     - `https://codingkickstarter.com/api/auth/github` (for production)

### Step 2: Get Your Credentials

After creating the app, you'll receive:
- **Client ID** (public, can be exposed)
- **Client Secret** (private, must be kept secure)

### Step 3: Configure Environment Variables

Add these to your `.env.local` file (for local development):

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Vercel), add these as environment variables in your Vercel project settings:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=https://codingkickstarter.com
```

### Optional: Custom Redirect URI

If you need to override the redirect URI, you can set:

```env
GITHUB_REDIRECT_URI=https://your-custom-domain.com/api/auth/github
```

## Redirect URI Rules

According to [GitHub OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#redirect-urls):

- The redirect URI must match the callback URL configured in your OAuth app settings
- The host and port must exactly match (excluding subdomains)
- The path must reference a subdirectory of the callback URL

### Examples

**Callback URL in GitHub**: `http://example.com/path`

✅ **Valid redirect URIs**:
- `http://example.com/path`
- `http://example.com/path/subdir`
- `http://oauth.example.com/path` (subdomain allowed)

❌ **Invalid redirect URIs**:
- `http://example.com/bar` (different path)
- `http://example.com:8080/path` (different port)
- `http://example.org` (different domain)

### Loopback URLs (Localhost)

For local development, you can use loopback URLs. According to GitHub docs:
- Use `127.0.0.1` instead of `localhost` (recommended by OAuth RFC)
- Port can differ from callback URL for native apps

## Security Features

The implementation follows GitHub OAuth best practices:

### ✅ PKCE (Proof Key for Code Exchange)
- Adds an extra layer of security
- Uses SHA-256 hashing (S256 method)
- Required code verifier in token exchange

### ✅ State Parameter
- Random, unguessable string
- Protects against CSRF attacks
- Stored in HTTP-only cookies

### ✅ Secure Cookie Settings
- `httpOnly`: Prevents JavaScript access
- `secure`: HTTPS only in production
- `sameSite: 'lax'`: CSRF protection
- 24-hour expiration for tokens

## OAuth Flow

1. **User initiates OAuth**: Clicks "Connect GitHub" button
2. **Redirect to GitHub**: User is redirected to GitHub authorization page
3. **User authorizes**: User grants permissions to the app
4. **GitHub redirects back**: With authorization code and state
5. **Code exchange**: Server exchanges code for access token
6. **Token storage**: Token stored in secure HTTP-only cookie
7. **Repository creation**: App can now create repos on user's behalf

## Scopes

The app requests the `repo` scope, which allows:
- Creating repositories
- Reading repository information
- Writing to repositories

This is the minimal scope needed for boilerplate generation.

## Troubleshooting

### Error: "redirect_uri is not associated with this application"

**Solution**: Make sure you've added the exact redirect URI to your GitHub OAuth app settings:
- Check the callback URL in GitHub settings
- Ensure both localhost and production URLs are added
- The URI must match exactly (including protocol, port, and path)

### Error: "Invalid state parameter"

**Solution**: This usually means:
- The state cookie expired (10-minute timeout)
- Cookies are blocked in browser
- Multiple OAuth attempts in quick succession

### Error: "GitHub OAuth is not configured"

**Solution**: Make sure environment variables are set:
- `GITHUB_CLIENT_ID` must be set
- Check your `.env.local` file (local) or Vercel environment variables (production)

### Token Exchange Fails

**Solution**: 
- Verify `GITHUB_CLIENT_SECRET` is correct
- Check that the authorization code hasn't expired
- Ensure PKCE code verifier matches (if using PKCE)

## Testing Locally

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Generate a sprint (idea + questions)
4. Click "Connect GitHub" in the boilerplate section
5. You should be redirected to GitHub for authorization

## Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel dashboard
2. Ensure `NEXT_PUBLIC_APP_URL` points to your production domain
3. Add production callback URL to GitHub OAuth app settings
4. Redeploy if you change environment variables

## References

- [GitHub OAuth Apps Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [OAuth 2.0 RFC 7636 (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

