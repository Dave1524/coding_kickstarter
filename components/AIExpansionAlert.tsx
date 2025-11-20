'use client';

import React, { useState } from 'react';

interface AIExpansionAlertProps {
  questionsAdded: number;
  onDismiss?: () => void;
}

export default function AIExpansionAlert({ questionsAdded, onDismiss }: AIExpansionAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };
  
  return (
    <div className="mt-4 bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg animate-fade-in" role="alert">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <span className="text-primary text-xl">💡</span>
          <div>
            <p className="text-primary font-semibold">
              Needs more detail - {questionsAdded} quick question{questionsAdded > 1 ? 's' : ''} added
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Great progress! We just need a bit more information to create the best guide for you.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-primary hover:text-primary/80 font-semibold text-sm ml-4"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

