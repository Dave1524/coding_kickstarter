'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  generateCursorDeepLink, 
  generateCursorWebDeepLink,
  extractProjectNameFromCommand,
} from '@/lib/command-config';
import { analytics } from '@/lib/analytics';
import { Sparkles, ExternalLink, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CursorDeepLinkButtonProps {
  command: string;
  isFirstStep?: boolean;
  stepNumber?: number;
  stepTitle?: string;
  className?: string;
}

type ButtonState = 'idle' | 'launching' | 'success' | 'error';

export default function CursorDeepLinkButton({
  command,
  isFirstStep = false,
  stepNumber = 1,
  stepTitle,
  className = '',
}: CursorDeepLinkButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [showWebFallback, setShowWebFallback] = useState(false);

  // Extract project name for the enhanced deep link
  const projectName = extractProjectNameFromCommand(command);

  // Generate both deep link formats
  const cursorDeepLink = generateCursorDeepLink(command, {
    isFirstStep,
    folderName: projectName || undefined,
    stepTitle,
  });
  
  const webDeepLink = generateCursorWebDeepLink(command, {
    isFirstStep,
    folderName: projectName || undefined,
  });

  const handleClick = useCallback(async () => {
    setState('launching');

    // Track analytics
    analytics.deepLinkClicked(stepNumber, isFirstStep);

    try {
      // Attempt to open the cursor:// protocol deep link
      window.location.href = cursorDeepLink;

      // Show success state after a brief delay
      setTimeout(() => {
        setState('success');
        
        // Show toast notification
        showToast(
          isFirstStep 
            ? '🚀 Opening Cursor with project setup prompt...' 
            : `Opening Cursor with step ${stepNumber} prompt...`,
          'success'
        );

        // Show web fallback option after success
        setTimeout(() => {
          setShowWebFallback(true);
          setState('idle');
        }, 3000);
      }, 500);

    } catch (error) {
      console.error('Failed to open Cursor deep link:', error);
      setState('error');
      setShowWebFallback(true);
      
      showToast(
        'Could not open Cursor. Try the web link instead.',
        'error'
      );

      // Track error
      analytics.errorOccurred('deep_link_failed', String(error));

      setTimeout(() => {
        setState('idle');
      }, 3000);
    }
  }, [cursorDeepLink, isFirstStep, stepNumber]);

  // Open via web (cursor.com) as fallback
  const handleWebFallback = useCallback(() => {
    window.open(webDeepLink, '_blank');
    showToast('Opening cursor.com...', 'success');
  }, [webDeepLink]);

  const getButtonContent = () => {
    switch (state) {
      case 'launching':
        return (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            <span>Opening Cursor...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Opened in Cursor!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Cursor not found</span>
          </>
        );
      default:
        return (
          <>
            {isFirstStep ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            <span>{isFirstStep ? 'Open in Cursor' : 'Open in Cursor'}</span>
          </>
        );
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        onClick={handleClick}
        disabled={state === 'launching'}
        size={isFirstStep ? 'lg' : 'default'}
        className={cn(
          "gap-2 font-semibold transition-all duration-300",
          isFirstStep && [
            "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
            "text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40",
            "hover:scale-[1.02] active:scale-[0.98]",
            "animate-pulse-subtle",
          ],
          !isFirstStep && [
            "bg-primary hover:bg-primary/90",
          ],
          state === 'success' && "bg-green-500 hover:bg-green-600",
          state === 'error' && "bg-red-500 hover:bg-red-600",
        )}
      >
        {getButtonContent()}
      </Button>

      {/* Web fallback link - always show for accessibility */}
      <button
        onClick={handleWebFallback}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors justify-center"
      >
        <Globe className="w-3 h-3" />
        <span>Or open via cursor.com</span>
      </button>
      
      {/* Help text */}
      {showWebFallback && state === 'error' && (
        <p className="text-xs text-muted-foreground text-center">
          Make sure <a href="https://cursor.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Cursor</a> is installed.
        </p>
      )}
    </div>
  );
}

/**
 * Simple toast notification helper
 */
function showToast(message: string, type: 'success' | 'error') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = cn(
    'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg',
    'flex items-center gap-2 text-sm font-medium',
    'animate-slide-in-up',
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white'
  );
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '✕'}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Add CSS animation via inline style
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    
    @keyframes pulse-subtle {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(249, 115, 22, 0);
      }
    }
    
    .animate-slide-in-up {
      animation: slide-in-up 0.3s ease-out;
    }
    
    .animate-fade-out {
      animation: fade-out 0.3s ease-out forwards;
    }
    
    .animate-pulse-subtle {
      animation: pulse-subtle 2s ease-in-out infinite;
    }
  `;
  
  // Only append if not already added
  if (!document.querySelector('style[data-cursor-deeplink]')) {
    style.setAttribute('data-cursor-deeplink', 'true');
    document.head.appendChild(style);
  }
}
