'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface GitHubAuthButtonProps {
  onAuthChange?: (authenticated: boolean, username?: string) => void;
  className?: string;
}

interface AuthStatus {
  authenticated: boolean;
  username?: string;
  loading: boolean;
  error?: string;
}

export default function GitHubAuthButton({ onAuthChange, className }: GitHubAuthButtonProps) {
  const [status, setStatus] = useState<AuthStatus>({
    authenticated: false,
    loading: true,
  });

  // Check auth status on mount and when URL changes (after OAuth callback)
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/github', { method: 'POST' });
      const data = await response.json();
      
      setStatus({
        authenticated: data.authenticated,
        username: data.username,
        loading: false,
      });
      
      onAuthChange?.(data.authenticated, data.username);
    } catch (error) {
      console.error('Failed to check GitHub auth status:', error);
      setStatus({
        authenticated: false,
        loading: false,
        error: 'Failed to check auth status',
      });
      onAuthChange?.(false);
    }
  }, [onAuthChange]);

  useEffect(() => {
    checkAuthStatus();

    // Check URL params for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const githubConnected = urlParams.get('github_connected');
    const githubError = urlParams.get('github_error');

    if (githubConnected === 'true') {
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('github_connected');
      window.history.replaceState({}, '', newUrl);
      
      // Re-check auth status
      checkAuthStatus();
    }

    if (githubError) {
      setStatus(prev => ({
        ...prev,
        error: getErrorMessage(githubError),
        loading: false,
      }));
      
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('github_error');
      window.history.replaceState({}, '', newUrl);
    }
  }, [checkAuthStatus]);

  const handleConnect = () => {
    // Redirect to GitHub OAuth
    window.location.href = '/api/auth/github';
  };

  const handleDisconnect = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    try {
      await fetch('/api/auth/github', { method: 'DELETE' });
      setStatus({
        authenticated: false,
        loading: false,
      });
      onAuthChange?.(false);
    } catch (error) {
      console.error('Failed to disconnect GitHub:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to disconnect',
      }));
    }
  };

  if (status.loading) {
    return (
      <Button 
        variant="outline" 
        disabled 
        className={className}
        aria-label="Checking GitHub connection..."
      >
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Checking...
      </Button>
    );
  }

  if (status.authenticated) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <GitHubIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            {status.username}
          </span>
          <span className="text-green-500 dark:text-green-500">✓</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Disconnect GitHub"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleConnect}
        variant="outline"
        className={`gap-2 ${className || ''}`}
        aria-label="Connect GitHub account"
      >
        <GitHubIcon className="h-4 w-4" />
        Connect GitHub
      </Button>
      {status.error && (
        <p className="text-sm text-destructive">{status.error}</p>
      )}
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'access_denied':
      return 'Access was denied. Please try again.';
    case 'no_code':
      return 'Authorization failed. Please try again.';
    case 'invalid_state':
      return 'Invalid request. Please try again.';
    case 'token_exchange_failed':
      return 'Failed to complete authorization. Please try again.';
    default:
      return `Authorization failed: ${errorCode}`;
  }
}

export { GitHubIcon };

