'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CTAState = 
  | 'idle' 
  | 'answering' 
  | 'finish-ready' 
  | 'checking' 
  | 'ready-generating' 
  | 'retry';

interface PrimaryCTAProps {
  // State flags
  questionSetLength: number;
  questionIndex: number;
  currentAnswer: string;
  loadingQuestions: boolean;
  loading: boolean;
  readyToGenerate: boolean;
  retryFunction: (() => Promise<void>) | null;
  idea: string;
  
  // Actions
  onStart: () => void;
  onNext: () => void;
  onRetry: () => void;
}

export default function PrimaryCTA({
  questionSetLength,
  questionIndex,
  currentAnswer,
  loadingQuestions,
  loading,
  readyToGenerate,
  retryFunction,
  idea,
  onStart,
  onNext,
  onRetry,
}: PrimaryCTAProps) {
  // Determine CTA state
  const getCTAState = (): CTAState => {
    // Retry state takes priority
    if (retryFunction) {
      return 'retry';
    }
    
    // No questions yet
    if (questionSetLength === 0) {
      return 'idle';
    }
    
    // Currently checking readiness
    if (loadingQuestions && questionIndex >= questionSetLength - 1) {
      return 'checking';
    }
    
    // Ready to generate and guide is generating
    if (readyToGenerate && loading) {
      return 'ready-generating';
    }
    
    // Ready to generate but not generating yet (shouldn't happen with auto-gen, but handle it)
    if (readyToGenerate) {
      return 'ready-generating';
    }
    
    // On last question with answer
    if (questionIndex === questionSetLength - 1 && currentAnswer.trim()) {
      return 'finish-ready';
    }
    
    // Active question (not last)
    if (questionIndex < questionSetLength) {
      return 'answering';
    }
    
    return 'idle';
  };

  const state = getCTAState();
  
  // Determine button props based on state
  const getButtonProps = () => {
    switch (state) {
      case 'idle':
        return {
          label: 'Start Questionnaire',
          disabled: loading || loadingQuestions || !idea.trim(),
          onClick: onStart,
          className: 'flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg',
          showSpinner: loadingQuestions,
          spinnerText: 'Generating questions...',
        };
      
      case 'answering':
        return {
          label: 'Next Question',
          disabled: loading || loadingQuestions || !currentAnswer.trim(),
          onClick: onNext,
          className: 'flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg',
          showSpinner: false,
          spinnerText: '',
        };
      
      case 'finish-ready':
        return {
          label: 'Finish & Check',
          disabled: loading || loadingQuestions || !currentAnswer.trim(),
          onClick: onNext,
          className: 'flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg',
          showSpinner: false,
          spinnerText: '',
        };
      
      case 'checking':
        return {
          label: 'Checking readiness...',
          disabled: true,
          onClick: () => {},
          className: 'flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg shadow-lg',
          showSpinner: true,
          spinnerText: 'Checking readiness...',
        };
      
      case 'ready-generating':
        return {
          label: 'Preparing your guide...',
          disabled: true,
          onClick: () => {},
          className: 'flex-1 bg-primary text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg',
          showSpinner: true,
          spinnerText: 'Preparing your guide...',
        };
      
      case 'retry':
        return {
          label: 'Retry',
          disabled: loading || loadingQuestions,
          onClick: onRetry,
          className: 'flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg',
          showSpinner: loading || loadingQuestions,
          spinnerText: 'Retrying...',
        };
      
      default:
        return {
          label: 'Continue',
          disabled: false,
          onClick: onNext,
          className: 'flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg',
          showSpinner: false,
          spinnerText: '',
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Button
      type={state === 'idle' ? 'submit' : 'button'}
      variant="default"
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
      className={cn(
        'w-full sm:w-auto',
        buttonProps.className,
        // Add clear disabled state styling
        buttonProps.disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-disabled={buttonProps.disabled}
    >
      {buttonProps.showSpinner ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {buttonProps.spinnerText}
        </span>
      ) : (
        buttonProps.label
      )}
    </Button>
  );
}

