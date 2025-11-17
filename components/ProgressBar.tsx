'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';

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
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
        <span>
          Question {answered + 1} of {total}
          {isAtMax && (
            <span className="ml-2 text-yellow-600 font-semibold">
              (Maximum: {maxQuestions} questions)
            </span>
          )}
        </span>
        <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-3"
        aria-label={`Questionnaire Progress`}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      />
      {isAtMax && answered < total && (
        <p className="text-xs text-muted-foreground italic mt-1">
          We'll use what you've provided to finish your guide
        </p>
      )}
    </div>
  );
}

