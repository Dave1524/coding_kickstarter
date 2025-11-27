'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'task-completion-';

/**
 * Hook for managing task completion state with localStorage persistence
 */
export function useTaskCompletion(taskId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${taskId}`;

  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isAutoChecked, setIsAutoChecked] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setIsCompleted(data.isCompleted || false);
        setIsAutoChecked(data.isAutoChecked || false);
      }
    } catch (error) {
      console.error('Failed to load task completion state:', error);
    }
  }, [storageKey]);

  // Save to localStorage when state changes
  const saveToStorage = useCallback((completed: boolean, autoChecked: boolean) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ isCompleted: completed, isAutoChecked: autoChecked })
      );
    } catch (error) {
      console.error('Failed to save task completion state:', error);
    }
  }, [storageKey]);

  const markCompleted = useCallback((completed: boolean, autoChecked = false) => {
    setIsCompleted(completed);
    setIsAutoChecked(autoChecked);
    saveToStorage(completed, autoChecked);
  }, [saveToStorage]);

  const toggleCompletion = useCallback(() => {
    const newState = !isCompleted;
    markCompleted(newState, false); // Manual toggle always sets autoChecked to false
  }, [isCompleted, markCompleted]);

  return {
    isCompleted,
    isAutoChecked,
    markCompleted,
    toggleCompletion,
  };
}

/**
 * Clear all task completion states (useful for resetting)
 */
export function clearAllTaskCompletions() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear task completions:', error);
  }
}



