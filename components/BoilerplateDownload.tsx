'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GitHubAuthButton, { GitHubIcon } from '@/components/GitHubAuthButton';
import AdvancedStackModal from '@/components/AdvancedStackModal';
import type { GenerateBoilerplateResponse } from '@/app/api/generate-boilerplate/route';

interface StackConfig {
  database: 'supabase' | 'mongodb';
  payments: 'lemonsqueezy' | 'stripe';
  emails: 'resend' | 'mailgun';
}

interface BoilerplateDownloadProps {
  idea: string;
  answers: Record<string, string>;
  suggestedName?: string;
}

type Status = 'idle' | 'generating' | 'downloading' | 'success' | 'error';

interface GenerationResult {
  repoUrl?: string;
  repoFullName?: string;
  zipUrl?: string;
  templateUrl?: string;
  useTemplateUrl?: string;
  error?: string;
  fallback?: boolean;
}

const STACK_LABELS: Record<string, string> = {
  supabase: 'Supabase',
  mongodb: 'MongoDB',
  lemonsqueezy: 'Lemon Squeezy',
  stripe: 'Stripe',
  resend: 'Resend',
  mailgun: 'Mailgun',
};

export default function BoilerplateDownload({ idea, answers, suggestedName }: BoilerplateDownloadProps) {
  const [projectName, setProjectName] = useState(suggestedName || generateProjectName(idea));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string>();
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showStackModal, setShowStackModal] = useState(false);
  const [stack, setStack] = useState<StackConfig>({
    database: 'supabase',
    payments: 'lemonsqueezy',
    emails: 'resend',
  });

  const handleAuthChange = useCallback((authenticated: boolean, username?: string) => {
    setIsAuthenticated(authenticated);
    setGithubUsername(username);
  }, []);

  const handleStackConfirm = (newStack: StackConfig) => {
    setStack(newStack);
    setShowStackModal(false);
  };

  const handleGenerate = async () => {
    if (!projectName.trim()) {
      setResult({ error: 'Please enter a project name' });
      return;
    }

    setStatus('generating');
    setResult(null);

    try {
      const response = await fetch('/api/generate-boilerplate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectName.trim(),
          idea,
          answers,
          stackConfig: stack,
        }),
      });

      const data: GenerateBoilerplateResponse = await response.json();

      if (data.success && data.repoUrl) {
        setStatus('success');
        setResult({
          repoUrl: data.repoUrl,
          repoFullName: data.repoFullName,
          zipUrl: data.zipUrl,
        });
      } else if (data.fallback) {
        setStatus('error');
        setResult({
          error: data.error,
          templateUrl: data.templateUrl,
          useTemplateUrl: data.useTemplateUrl,
          fallback: true,
        });
      } else {
        setStatus('error');
        setResult({ error: data.error || 'Failed to generate boilerplate' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      setStatus('error');
      setResult({ error: 'Network error. Please try again.' });
    }
  };

  const handleDownloadZip = async () => {
    if (!projectName.trim()) {
      setResult({ error: 'Please enter a project name' });
      return;
    }

    setStatus('downloading');
    setResult(null);

    try {
      const params = new URLSearchParams({
        projectName: projectName.trim(),
        idea,
        database: stack.database,
        payments: stack.payments,
        emails: stack.emails,
      });

      const response = await fetch(`/api/download-zip?${params}`);

      if (response.status === 429) {
        const data = await response.json();
        setStatus('error');
        setResult({ error: data.message || 'Rate limit exceeded. Please try again later.' });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate ZIP');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.trim()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');
      setResult({
        error: undefined,
        fallback: false,
      });
    } catch (error) {
      console.error('Download error:', error);
      setStatus('error');
      setResult({ error: 'Failed to download ZIP. Please try again.' });
    }
  };

  return (
    <>
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🚀</span>
            <span>Get Starter Repo</span>
          </CardTitle>
          <CardDescription>
            Generate a production-ready Next.js boilerplate customized for your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stack Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Selected Stack</Label>
              <button
                onClick={() => setShowStackModal(true)}
                className="text-xs text-primary hover:underline"
              >
                Customize →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Next.js 16</Badge>
              <Badge>React 19</Badge>
              <Badge variant="outline">{STACK_LABELS[stack.database]}</Badge>
              <Badge>NextAuth v5</Badge>
              <Badge variant="outline">{STACK_LABELS[stack.payments]}</Badge>
              <Badge variant="outline">{STACK_LABELS[stack.emails]}</Badge>
              <Badge>Shadcn/ui</Badge>
            </div>
          </div>

          {/* Project Name Input */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-app"
              disabled={status === 'generating' || status === 'downloading'}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              This will be your GitHub repository name
            </p>
          </div>

          {/* GitHub Auth */}
          <div className="space-y-2">
            <Label>GitHub Connection</Label>
            <GitHubAuthButton onAuthChange={handleAuthChange} />
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground">
                Connect GitHub to create a repo automatically, or download as ZIP
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Primary: Create GitHub Repo */}
            {isAuthenticated ? (
              <Button
                onClick={handleGenerate}
                disabled={status === 'generating' || status === 'downloading' || !projectName.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {status === 'generating' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Repository...
                  </>
                ) : (
                  <>
                    <GitHubIcon className="h-4 w-4" />
                    Create GitHub Repository
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2"
                size="lg"
                onClick={() => window.location.href = '/api/auth/github'}
              >
                <GitHubIcon className="h-4 w-4" />
                Connect GitHub to Create Repo
              </Button>
            )}

            {/* Secondary: Download ZIP */}
            <Button
              variant="secondary"
              onClick={handleDownloadZip}
              disabled={status === 'generating' || status === 'downloading' || !projectName.trim()}
              className="w-full gap-2"
            >
              {status === 'downloading' ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating ZIP...
                </>
              ) : (
                <>
                  📦 Download ZIP (No GitHub Required)
                </>
              )}
            </Button>

            {/* Tertiary: Template Link */}
            <a
              href="https://github.com/Dave1524/coding-kickstarter-template/generate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Or use the template directly on GitHub →
            </a>
          </div>

          {/* Success State */}
          {status === 'success' && result?.repoUrl && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <span className="text-xl">✅</span>
                <span className="font-semibold">Repository Created!</span>
              </div>
              <div className="space-y-2">
                <a
                  href={result.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full gap-2" variant="default">
                    <GitHubIcon className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </a>
                {result.zipUrl && (
                  <a
                    href={result.zipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-2" variant="outline">
                      📦 Download ZIP
                    </Button>
                  </a>
                )}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                <p className="font-medium">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Clone your new repository</li>
                  <li>Run <code className="bg-green-100 dark:bg-green-900 px-1 rounded">npm install</code></li>
                  <li>Copy <code className="bg-green-100 dark:bg-green-900 px-1 rounded">.env.example</code> to <code className="bg-green-100 dark:bg-green-900 px-1 rounded">.env.local</code></li>
                  <li>Run <code className="bg-green-100 dark:bg-green-900 px-1 rounded">npm run dev</code></li>
                </ol>
              </div>
            </div>
          )}

          {/* ZIP Download Success */}
          {status === 'success' && !result?.repoUrl && !result?.error && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <span className="text-xl">✅</span>
                <span className="font-semibold">ZIP Downloaded!</span>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                <p className="font-medium">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Extract the ZIP file</li>
                  <li>Run <code className="bg-green-100 dark:bg-green-900 px-1 rounded">npm install</code></li>
                  <li>Rename <code className="bg-green-100 dark:bg-green-900 px-1 rounded">env.example.txt</code> to <code className="bg-green-100 dark:bg-green-900 px-1 rounded">.env.local</code></li>
                  <li>Run <code className="bg-green-100 dark:bg-green-900 px-1 rounded">npm run dev</code></li>
                </ol>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && result && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <span className="text-xl">⚠️</span>
                <span className="font-semibold">
                  {result.fallback ? 'Using Fallback' : 'Error'}
                </span>
              </div>
              {result.error && (
                <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
              )}
              {result.fallback && result.useTemplateUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    You can still create the repo manually:
                  </p>
                  <a
                    href={result.useTemplateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full gap-2" variant="outline">
                      <GitHubIcon className="h-4 w-4" />
                      Use Template on GitHub
                    </Button>
                  </a>
                </div>
              )}
              {!result.fallback && (
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
            <p>⏱️ Estimated setup time: ~2 minutes</p>
            <p>📦 Includes: Auth, Payments, Email, Dashboard, UI components</p>
            <p>🔒 Your GitHub token is only stored in session (not persisted)</p>
          </div>
        </CardContent>
      </Card>

      {/* Stack Customization Modal */}
      <AdvancedStackModal
        isOpen={showStackModal}
        onClose={() => setShowStackModal(false)}
        onConfirm={handleStackConfirm}
        idea={idea}
        answers={answers}
        initialStack={stack}
      />
    </>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'outline' }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = variant === 'outline' 
    ? 'border border-primary/30 text-primary bg-transparent'
    : 'bg-primary/10 text-primary';
  
  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {children}
    </span>
  );
}

function generateProjectName(idea: string): string {
  // Extract key words from idea and create a slug
  const words = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 3);
  
  if (words.length === 0) {
    return 'my-saas-app';
  }
  
  return words.join('-');
}
