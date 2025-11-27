'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export default function CopyButton({ 
  text, 
  className = '',
  variant = 'default',
  showLabel = false,
  size = showLabel ? 'default' : 'icon',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Icon-only button (legacy behavior for code blocks)
  if (!showLabel && size === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          "p-1.5 rounded-md transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          variant === 'secondary' 
            ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-zinc-100"
            : "bg-zinc-800 hover:bg-zinc-700 text-green-400 hover:text-green-300",
          copied && "bg-green-600 text-white",
          className
        )}
        aria-label={copied ? 'Copied!' : 'Copy command to clipboard'}
        title={copied ? 'Copied!' : 'Copy command'}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Button with label
  return (
    <Button
      onClick={handleCopy}
      variant={variant === 'default' ? 'default' : variant}
      size={size}
      className={cn(
        "gap-2 transition-all duration-200",
        copied && "bg-green-600 hover:bg-green-600 text-white",
        className
      )}
      aria-label={copied ? 'Copied!' : 'Copy command to clipboard'}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy command</span>
        </>
      )}
    </Button>
  );
}
