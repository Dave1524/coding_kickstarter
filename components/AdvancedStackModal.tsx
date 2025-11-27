'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface StackConfig {
  database: 'supabase' | 'mongodb';
  payments: 'lemonsqueezy' | 'stripe';
  emails: 'resend' | 'mailgun';
}

interface StackSuggestion {
  database: 'supabase' | 'mongodb';
  payments: 'lemonsqueezy' | 'stripe';
  emails: 'resend' | 'mailgun';
  reasoning: {
    database: string;
    payments: string;
    emails: string;
  };
  confidence: number;
}

interface AdvancedStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (stack: StackConfig) => void;
  idea: string;
  answers: Record<string, string>;
  initialStack?: Partial<StackConfig>;
}

const STACK_OPTIONS = {
  database: [
    { value: 'supabase', label: 'Supabase', description: 'PostgreSQL with real-time, auth, and storage' },
    { value: 'mongodb', label: 'MongoDB', description: 'Flexible document database for complex data' },
  ],
  payments: [
    { value: 'lemonsqueezy', label: 'Lemon Squeezy', description: 'Simple payments, handles taxes globally' },
    { value: 'stripe', label: 'Stripe', description: 'Full control, complex payment flows' },
  ],
  emails: [
    { value: 'resend', label: 'Resend', description: 'Modern API with React Email support' },
    { value: 'mailgun', label: 'Mailgun', description: 'High volume transactional emails' },
  ],
} as const;

export default function AdvancedStackModal({
  isOpen,
  onClose,
  onConfirm,
  idea,
  answers,
  initialStack,
}: AdvancedStackModalProps) {
  const [stack, setStack] = useState<StackConfig>({
    database: initialStack?.database || 'supabase',
    payments: initialStack?.payments || 'lemonsqueezy',
    emails: initialStack?.emails || 'resend',
  });
  
  const [suggestion, setSuggestion] = useState<StackSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Fetch AI suggestion when modal opens
  useEffect(() => {
    if (isOpen && idea && !suggestion) {
      fetchSuggestion();
    }
  }, [isOpen, idea]);

  const fetchSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const response = await fetch('/api/infer-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, answers }),
      });
      
      const data = await response.json();
      
      if (data.success && data.suggestion) {
        setSuggestion(data.suggestion);
      }
    } catch (error) {
      console.error('Failed to fetch stack suggestion:', error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      setStack({
        database: suggestion.database,
        payments: suggestion.payments,
        emails: suggestion.emails,
      });
    }
  };

  const handleConfirm = () => {
    onConfirm(stack);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>⚙️</span>
            <span>Customize Your Stack</span>
          </CardTitle>
          <CardDescription>
            Choose the technologies for your boilerplate. Defaults work great for most projects.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* AI Suggestion Banner */}
          {loadingSuggestion ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm font-medium">AI is analyzing your project...</span>
              </div>
            </div>
          ) : suggestion && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span>🤖</span>
                  <span className="text-sm font-medium">AI Recommendation</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applySuggestion}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Apply Suggestion
                </Button>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                <p><strong>Database:</strong> {suggestion.reasoning.database}</p>
                <p><strong>Payments:</strong> {suggestion.reasoning.payments}</p>
                <p><strong>Emails:</strong> {suggestion.reasoning.emails}</p>
              </div>
            </div>
          )}

          {/* Database Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Database</Label>
            <div className="grid grid-cols-2 gap-3">
              {STACK_OPTIONS.database.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStack({ ...stack, database: option.value as 'supabase' | 'mongodb' })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    stack.database === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{option.label}</span>
                    {suggestion?.database === option.value && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Payments Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Payments</Label>
            <div className="grid grid-cols-2 gap-3">
              {STACK_OPTIONS.payments.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStack({ ...stack, payments: option.value as 'lemonsqueezy' | 'stripe' })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    stack.payments === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{option.label}</span>
                    {suggestion?.payments === option.value && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Emails Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Emails</Label>
            <div className="grid grid-cols-2 gap-3">
              {STACK_OPTIONS.emails.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStack({ ...stack, emails: option.value as 'resend' | 'mailgun' })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    stack.emails === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{option.label}</span>
                    {suggestion?.emails === option.value && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Stack
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

