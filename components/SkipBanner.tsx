'use client';

import React, { useState } from 'react';

interface SkipBannerProps {
  questionText: string;
  onSkip: () => void;
  onCancel: () => void;
}

export default function SkipBanner({ questionText, onSkip, onCancel }: SkipBannerProps) {
  return (
    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg animate-fade-in" role="alert">
      <div className="flex items-start gap-3">
        <span className="text-yellow-600 text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-yellow-800 font-semibold mb-1">Skip this question?</p>
          <p className="text-yellow-700 text-sm mb-3">
            You can answer this later. Skipping may affect the quality of your setup guide.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold transition-all text-sm"
            >
              Yes, Skip
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border-2 border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 font-semibold transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

