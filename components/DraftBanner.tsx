'use client';

import React from 'react';
import { loadDraft } from '@/hooks/useAutoSave';

interface DraftBannerProps {
  onResume: () => void;
  onDiscard: () => void;
}

export default function DraftBanner({ onResume, onDiscard }: DraftBannerProps) {
  const draft = loadDraft();
  
  if (!draft || !draft.idea) return null;
  
  const draftDate = draft.timestamp ? new Date(draft.timestamp).toLocaleString() : 'recently';
  const answeredCount = Object.keys(draft.answers || {}).length;
  const totalQuestions = draft.questionSet?.length || 0;
  
  return (
    <div className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-6 shadow-lg animate-fade-in" role="alert">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>📝</span>
            <span>Resume your saved questionnaire?</span>
          </h3>
          <div className="text-sm text-gray-700 space-y-1 mb-4">
            <p><strong>Idea:</strong> {draft.idea.substring(0, 100)}{draft.idea.length > 100 ? '...' : ''}</p>
            <p><strong>Progress:</strong> {answeredCount} of {totalQuestions} questions answered</p>
            <p><strong>Saved:</strong> {draftDate}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onResume}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-semibold transition-all"
            >
              Resume Draft
            </button>
            <button
              onClick={onDiscard}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

