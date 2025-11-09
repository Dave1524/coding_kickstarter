'use client';

import React from 'react';

interface ProgressBarProps {
  answered: number;
  total: number;
  maxQuestions: number;
}

export default function ProgressBar({ answered, total, maxQuestions }: ProgressBarProps) {
  const progress = total > 0 ? Math.min((answered / total) * 100, 100) : 0;
  const isAtMax = total >= maxQuestions;
  
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
        <span>
          Question {answered + 1} of {total}
          {isAtMax && (
            <span className="ml-2 text-yellow-600 font-semibold">
              (Maximum: {maxQuestions} questions)
            </span>
          )}
        </span>
        <span className="font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${Math.round(progress)}%`}
        />
      </div>
      {isAtMax && answered < total && (
        <p className="text-xs text-gray-500 italic mt-1">
          We'll use what you've provided to finish your guide
        </p>
      )}
    </div>
  );
}

