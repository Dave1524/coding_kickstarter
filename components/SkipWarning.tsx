'use client';

import React from 'react';

interface SkipWarningProps {
  skippedCount: number;
}

export default function SkipWarning({ skippedCount }: SkipWarningProps) {
  if (skippedCount === 0) return null;
  
  return (
    <p className="text-sm text-yellow-700 mt-2 flex items-center gap-1">
      <span>⚠️</span>
      <span>Guide will be less precise because {skippedCount} question{skippedCount > 1 ? 's were' : ' was'} skipped</span>
    </p>
  );
}

