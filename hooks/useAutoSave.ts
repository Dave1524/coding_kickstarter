import { useEffect, useRef } from 'react';

interface DraftData {
  idea: string;
  answers: Record<string, string>;
  questionTexts: Record<string, string>;
  questionSet: Array<{
    id: string;
    text: string;
    type: 'text' | 'select';
    options?: string[];
    placeholder?: string;
  }>;
  questionIndex: number;
  skippedQuestions: string[];
  timestamp: number;
}

const DRAFT_STORAGE_KEY = 'coding_kickstarter_draft';

export function useAutoSave(
  idea: string,
  answers: Record<string, string>,
  questionTexts: Record<string, string>,
  questionSet: Array<{
    id: string;
    text: string;
    type: 'text' | 'select';
    options?: string[];
    placeholder?: string;
  }>,
  questionIndex: number,
  skippedQuestions: Set<string>
) {
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Auto-save every 10 seconds
  useEffect(() => {
    // Only save if there's meaningful data
    if (idea.trim() || Object.keys(answers).length > 0 || questionSet.length > 0) {
      saveIntervalRef.current = setInterval(() => {
        const draft: DraftData = {
          idea,
          answers,
          questionTexts,
          questionSet,
          questionIndex,
          skippedQuestions: Array.from(skippedQuestions),
          timestamp: Date.now(),
        };
        
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
          lastSaveRef.current = Date.now();
        } catch (err) {
          console.warn('Failed to save draft:', err);
        }
      }, 10000); // 10 seconds
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [idea, answers, questionTexts, questionSet, questionIndex, skippedQuestions]);

  return { lastSaveTime: lastSaveRef.current };
}

export function loadDraft(): DraftData | null {
  try {
    const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!draftJson) return null;

    const draft = JSON.parse(draftJson) as DraftData;
    
    // Check if draft is older than 24 hours
    const draftAge = Date.now() - draft.timestamp;
    if (draftAge > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }

    return draft;
  } catch (err) {
    console.warn('Failed to load draft:', err);
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear draft:', err);
  }
}

