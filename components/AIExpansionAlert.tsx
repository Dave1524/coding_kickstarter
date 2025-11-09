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
    <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg animate-fade-in" role="alert">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <span className="text-blue-500 text-xl">💡</span>
          <div>
            <p className="text-blue-800 font-semibold">
              Needs more detail - {questionsAdded} quick question{questionsAdded > 1 ? 's' : ''} added
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Great progress! We just need a bit more information to create the best guide for you.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm ml-4"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

