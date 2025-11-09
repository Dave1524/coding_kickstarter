'use client';

import { useState, useRef, useEffect } from 'react';
import PDFDownload from '@/components/PDFDownload';
import EarlyAccessModal from '@/components/EarlyAccessModal';
import PrimaryCTA from '@/components/PrimaryCTA';
import ProgressBar from '@/components/ProgressBar';
import LayerLabel from '@/components/LayerLabel';
import AIExpansionAlert from '@/components/AIExpansionAlert';
import SkipBanner from '@/components/SkipBanner';
import SkipWarning from '@/components/SkipWarning';
import DraftBanner from '@/components/DraftBanner';
import { validateAnswer, validateIdea } from '@/lib/validation';
import { useAutoSave, loadDraft, clearDraft } from '@/hooks/useAutoSave';
import { validateGenerateQuestionsResponse, validateCheckReadinessResponse, validateGenerateResponse } from '@/lib/api-validation';
import { sanitizeInput, checkRateLimit, escapeHtml } from '@/lib/security';
import { sanitizeInputSync } from '@/lib/security-client';
import { analytics } from '@/lib/analytics';

type Question = {
  id: string;
  text: string;
  type: 'text' | 'select';
  options?: string[];
  placeholder?: string;
};

interface GenerateResult {
  provider: string;
  model: string;
  idea: string;
  answers: Record<string, string>;
  output: {
    top5: Array<{
      title: string;
      cursorPrompt?: string;
      command?: string;
      supabaseTip?: string;
    }>;
    kanbanMarkdown: string;
    blueprint: {
      epics: {
        input: string[];
        output: string[];
        export: string[];
        history: string[];
      };
    };
    pdfMeta: {
      appName: string;
      gradient: [string, string];
      timestamp: string;
    };
  };
  steps: string[];
  kanbanMarkdown: string;
  blueprint?: {
    epics?: string[];
  };
  timestamp: string;
}

export default function Home() {
  const [idea, setIdea] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionTexts, setQuestionTexts] = useState<Record<string, string>>({});
  const [questionSet, setQuestionSet] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState('');
  const [saveError, setSaveError] = useState('');
  const [earlyOpen, setEarlyOpen] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSkipBanner, setShowSkipBanner] = useState(false);
  const [retryFunction, setRetryFunction] = useState<(() => Promise<void>) | null>(null);
  const [questionsAddedCount, setQuestionsAddedCount] = useState(0);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [errorDetailsExpanded, setErrorDetailsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  // Auto-save draft
  useAutoSave(idea, answers, questionTexts, questionSet, questionIndex, skippedQuestions);

  // Load draft on mount - show banner instead of confirm dialog
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.idea) {
      setShowDraftBanner(true);
    }
  }, []); // Only run on mount

  // Handle draft resume
  const handleDraftResume = () => {
    const draft = loadDraft();
    if (draft && draft.idea) {
      setIdea(draft.idea);
      setAnswers(draft.answers);
      setQuestionTexts(draft.questionTexts);
      setQuestionSet(draft.questionSet);
      setQuestionIndex(draft.questionIndex);
      setSkippedQuestions(new Set(draft.skippedQuestions));
      setShowDraftBanner(false);
      
      // Scroll to first incomplete question
      setTimeout(() => {
        const firstIncompleteIndex = draft.questionSet.findIndex((q: Question) => !draft.answers[q.id] && !draft.skippedQuestions?.includes(q.id));
        if (firstIncompleteIndex >= 0) {
          setQuestionIndex(firstIncompleteIndex);
          const currentQ = draft.questionSet[firstIncompleteIndex];
          if (currentQ && draft.answers[currentQ.id]) {
            setCurrentAnswer(draft.answers[currentQ.id]);
          } else {
            setCurrentAnswer('');
          }
        }
        // Scroll to question input
        setTimeout(() => {
          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }, 100);
    }
  };

  // Handle draft discard
  const handleDraftDiscard = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  // Generate questions when idea is submitted
  async function generateQuestions() {
    const ideaValidation = validateIdea(idea.trim());
    if (!ideaValidation.isValid) {
      setError(ideaValidation.error || 'Please enter a valid project idea.');
      return;
    }

    // Rate limiting check
    if (!checkRateLimit('generate-questions', 5, 60000)) {
      setError('Too many requests. Please wait a minute before trying again.');
      return;
    }

    setLoadingQuestions(true);
    setError('');
    setValidationErrors({});

    try {
      const sanitizedIdea = sanitizeInput(idea.trim());
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: sanitizedIdea }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to generate questions');
      }

      // Validate response structure
      if (!data) {
        throw new Error('No data received from server');
      }
      
      const validatedData = validateGenerateQuestionsResponse(data);

      if (!validatedData.questions || validatedData.questions.length === 0) {
        throw new Error('No questions generated');
      }

      setQuestionSet(validatedData.questions);
      setQuestionIndex(0);
      setReadyToGenerate(false);
      setAnswers({});
      setCurrentAnswer('');
      
      // Track analytics
      analytics.questionGenerated(idea.trim().length, validatedData.questions.length);
    } catch (err) {
      setLoadingQuestions(false); // Reset loading state before showing error
      setError(err instanceof Error ? err.message : 'Something went wrong while generating questions.');
      // Preserve state and set retry function
      setRetryFunction(() => async () => {
        await generateQuestions();
      });
      // Track analytics
      analytics.errorOccurred('generate_questions', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingQuestions(false);
    }
  }

  // Check readiness after all questions answered
  async function checkReadiness(updatedAnswers?: Record<string, string>) {
    setLoadingQuestions(true);
    setError('');

    const answersToUse = updatedAnswers || answers;

    try {
      const res = await fetch('/api/check-readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          answers: answersToUse,
          questionsAsked: Object.keys(answersToUse),
          skippedQuestions: Array.from(skippedQuestions),
          maxQuestionsRemaining: 7 - Object.keys(answersToUse).length,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to check readiness');
      }

      // Validate response structure
      if (!data) {
        throw new Error('No data received from server');
      }
      
      const validatedData = validateCheckReadinessResponse(data);

      // Track analytics
      analytics.readinessChecked(questionSet.length, Object.keys(answersToUse).length, skippedQuestions.size);

      if (validatedData.needsMoreQuestions && validatedData.nextQuestions && validatedData.nextQuestions.length > 0) {
        // Enforce 7 question maximum
        const currentTotal = questionSet.length;
        const remainingSlots = 7 - currentTotal;
        
      if (remainingSlots > 0) {
        const questionsToAdd = validatedData.nextQuestions.slice(0, remainingSlots);
        // Add new questions to the set
        setQuestionSet((prev) => {
          const updated = [...prev, ...questionsToAdd];
          setQuestionIndex(prev.length); // Move to first new question
          return updated;
        });
        setReadyToGenerate(validatedData.readyToGenerate);
        setQuestionsAddedCount(questionsToAdd.length); // Track for alert
        
        if (validatedData.nextQuestions.length > remainingSlots) {
          setError(`Question limit reached (7 max). Only ${remainingSlots} additional question(s) added.`);
        }
        } else {
          // Already at limit, mark as ready
          setReadyToGenerate(true);
          setTimeout(() => {
            generateGuide(answersToUse);
          }, 100);
        }
      } else {
        // No more questions needed - ready to generate
        setReadyToGenerate(true);
        // Auto-generate guide after a brief delay to ensure state is updated
        setTimeout(() => {
          generateGuide(answersToUse);
        }, 100);
      }
    } catch (err) {
      setLoadingQuestions(false); // Reset loading state before showing error
      setError(err instanceof Error ? err.message : 'Something went wrong while checking readiness.');
      // Preserve state and set retry function
      setRetryFunction(() => () => checkReadiness(answersToUse));
      // Track analytics
      analytics.errorOccurred('check_readiness', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  // Handle Skip Question
  function handleSkipQuestion() {
    const currentQ = questionSet[questionIndex];
    if (!currentQ) return;

    const newSkipped = new Set(skippedQuestions);
    newSkipped.add(currentQ.id);
    setSkippedQuestions(newSkipped);
    setCurrentAnswer('');
    setError('');
    setShowSkipBanner(false);

    // Track analytics
    analytics.questionSkipped(questionIndex);

    // Auto-advance to next question or check readiness
    if (questionIndex === questionSet.length - 1) {
      // Last question skipped, check readiness
      checkReadiness(answers);
    } else {
      setQuestionIndex(questionIndex + 1);
      // Auto-focus next input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }

  // Handle Previous Question button
  function handlePreviousQuestion() {
    if (questionIndex === 0) return;

    const prevIndex = questionIndex - 1;
    const prevQuestion = questionSet[prevIndex];
    
    // Load previous answer if it exists
    if (prevQuestion && answers[prevQuestion.id]) {
      setCurrentAnswer(answers[prevQuestion.id]);
    } else {
      setCurrentAnswer('');
    }
    
    setQuestionIndex(prevIndex);
    setError('');
    
    // Track analytics
    analytics.questionNavigatedBack(questionIndex, prevIndex);
  }

  // Handle Next Question button
  async function handleNextQuestion() {
    const currentQ = questionSet[questionIndex];
    if (!currentQ) return;

    const answerValue = currentAnswer.trim();
    
    // Validate answer
    const validation = validateAnswer(answerValue, currentQ.id, currentQ.text);
    if (!validation.isValid) {
      setValidationErrors({ ...validationErrors, [currentQ.id]: validation.error || 'Invalid answer' });
      setError(validation.error || 'Please provide a valid answer.');
      return;
    }

    // Sanitize answer before saving (use client-side version for better XSS protection)
    const sanitizedAnswer = sanitizeInputSync(answerValue);

    // Clear validation errors
    const newValidationErrors = { ...validationErrors };
    delete newValidationErrors[currentQ.id];
    setValidationErrors(newValidationErrors);
    setError('');

    // Remove from skipped if it was skipped before
    const newSkipped = new Set(skippedQuestions);
    newSkipped.delete(currentQ.id);
    setSkippedQuestions(newSkipped);

    // Save current answer and question text
    const newAnswers = { ...answers, [currentQ.id]: sanitizedAnswer };
    const newQuestionTexts = { ...questionTexts, [currentQ.id]: currentQ.text };
    setAnswers(newAnswers);
    setQuestionTexts(newQuestionTexts);
    setCurrentAnswer('');

    // Track analytics
    analytics.questionAnswered(questionIndex, sanitizedAnswer.length, currentQ.type);

    // Check if this is the last question
    if (questionIndex === questionSet.length - 1) {
      // All questions answered, check readiness with updated answers
      await checkReadiness(newAnswers);
    } else {
      // Move to next question
      setQuestionIndex(questionIndex + 1);
    }
  }

  // Auto-focus input when question changes
  useEffect(() => {
    if (questionSet.length > 0 && questionIndex < questionSet.length && inputRef.current) {
      inputRef.current.focus();
    }
  }, [questionIndex, questionSet.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!idea.trim()) {
      setError('Please enter a project idea before generating a guide.');
      return;
    }

    // If no questions generated yet, generate them first
    if (questionSet.length === 0) {
      await generateQuestions();
      return;
    }

    // Otherwise, proceed with guide generation
    await generateGuide();
  }

  async function generateGuide(answersOverride?: Record<string, string>) {
    if (!idea.trim()) {
      setError('Please enter a project idea before generating a guide.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setSavedId('');
    setSaveError('');

    const answersToUse = answersOverride || answers;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim(), answers: answersToUse }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.hint || 'Failed to generate');
      }

      // Validate response structure
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // For generate response, be more lenient with validation
      let validatedData;
      try {
        validatedData = validateGenerateResponse(data);
      } catch (error) {
        // If validation fails, use the data anyway but log the error
        console.warn('Response validation failed, using data as-is:', error);
        validatedData = data;
      }

      // Track analytics
      analytics.guideGenerated(questionSet.length, Object.keys(answersToUse).length);

      // Store question texts before resetting state (needed for PDF)
      const savedQuestionTexts = { ...questionTexts };
      
      setResult(validatedData);
      // Reset questionnaire state
      setAnswers({});
      setQuestionTexts({});
      setQuestionSet([]);
      setQuestionIndex(0);
      setReadyToGenerate(false);
      setCurrentAnswer('');
      setSkippedQuestions(new Set());
      setRetryFunction(null);
      setLoadingQuestions(false); // Reset loading questions state
      setQuestionsAddedCount(0); // Reset expansion alert
      clearDraft(); // Clear draft on successful generation
      
      // Store question texts in result for PDF generation
      (validatedData as any).questionTexts = savedQuestionTexts;
    } catch (err) {
      setLoading(false); // Reset loading state before showing error
      setLoadingQuestions(false);
      setError(err instanceof Error ? err.message : 'Something went wrong while generating your guide.');
      // Preserve state and set retry function
      setRetryFunction(() => async () => {
        await generateGuide(answersToUse);
      });
      // Track analytics
      analytics.errorOccurred('generate_guide', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingQuestions(false); // Always reset loading questions state
    }
  }

  async function handleSave() {
    if (!result) return;

    setIsSaving(true);
    setSaveError('');
    setSavedId('');

    try {
      const res = await fetch('/api/save-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: result.idea,
          questions: Object.entries(result.answers).map(([key, value]) => {
            return `${key}: ${value}`;
          }),
          top_steps: result.output.top5.map((s) => s.title),
          blueprint: {
            epics: [
              ...(result.output.blueprint.epics.input || []),
              ...(result.output.blueprint.epics.output || []),
              ...(result.output.blueprint.epics.export || []),
              ...(result.output.blueprint.epics.history || []),
            ],
            kanbanMarkdown: result.output.kanbanMarkdown,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save sprint');
      }

      setSavedId(data.id);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong while saving your sprint.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 p-4 sm:p-8">
        {/* Header */}
        <header className="text-center mb-10 sm:mb-12 pt-6 sm:pt-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full p-4 shadow-lg">
                <span className="text-4xl">🚀</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Coding Kickstarter
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            No setup paralysis, just code!
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Powered by AI
            </span>
          </div>
        </header>

        {/* Draft Banner */}
        {showDraftBanner && (
          <DraftBanner
            onResume={handleDraftResume}
            onDiscard={handleDraftDiscard}
          />
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-12 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-200/50 hover:shadow-2xl transition-all duration-300">
            <label htmlFor="idea" className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span>What do you want to build?</span>
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !loading && !loadingQuestions && idea.trim() && questionSet.length === 0) {
                  e.preventDefault();
                  const form = e.currentTarget.closest('form');
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              placeholder="e.g., Todo app for 100 users, chat app for teams, weather dashboard..."
              className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none font-sans"
              rows={4}
              disabled={loading || loadingQuestions}
              aria-describedby="idea-description"
              aria-required="true"
            />
            <p id="idea-description" className="sr-only">
              Enter your project idea. This will be used to generate personalized setup questions.
            </p>

            {/* Loading Questions State */}
            {loadingQuestions && (
              <div className="mt-6 text-center py-4 animate-fade-in" role="status" aria-live="polite">
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-semibold">Generating questions...</span>
                </div>
              </div>
            )}

            {/* AI Expansion Alert */}
            {questionsAddedCount > 0 && (
              <AIExpansionAlert
                questionsAdded={questionsAddedCount}
                onDismiss={() => setQuestionsAddedCount(0)}
              />
            )}

            {/* Questions */}
            {!loadingQuestions && questionSet.length > 0 && questionIndex < questionSet.length && (
              <div className="mt-6 space-y-2 animate-fade-in" role="region" aria-label="Questionnaire">
                {/* Progress Bar */}
                <ProgressBar
                  answered={Object.keys(answers).length}
                  total={questionSet.length}
                  maxQuestions={7}
                />
                
                {/* Layer Label */}
                <LayerLabel
                  questionIndex={questionIndex}
                  totalQuestions={questionSet.length}
                />
                
                <label htmlFor={`question-${questionSet[questionIndex].id}`} className="block text-lg font-semibold text-gray-800">
                  {questionSet[questionIndex].text}
                </label>
                {questionSet[questionIndex].type === 'select' && questionSet[questionIndex].options ? (
                  <select
                    ref={(el) => (inputRef.current = el)}
                    id={`question-${questionSet[questionIndex].id}`}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-sans"
                    value={currentAnswer}
                    onChange={(e) => {
                      setCurrentAnswer(e.target.value);
                      // Clear validation error when user selects
                      if (validationErrors[questionSet[questionIndex].id]) {
                        const newErrors = { ...validationErrors };
                        delete newErrors[questionSet[questionIndex].id];
                        setValidationErrors(newErrors);
                        setError('');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setCurrentAnswer('');
                      }
                    }}
                    disabled={loading || loadingQuestions}
                    aria-label={questionSet[questionIndex].text}
                    aria-required="true"
                    aria-invalid={!!validationErrors[questionSet[questionIndex].id]}
                    aria-describedby={validationErrors[questionSet[questionIndex].id] ? `error-${questionSet[questionIndex].id}` : undefined}
                  >
                    <option value="">
                      Choose...
                    </option>
                    {questionSet[questionIndex].options!.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    ref={(el) => (inputRef.current = el)}
                    id={`question-${questionSet[questionIndex].id}`}
                    type="text"
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-sans"
                    placeholder={questionSet[questionIndex].placeholder || 'Type your answer...'}
                    value={currentAnswer}
                    onChange={(e) => {
                      setCurrentAnswer(e.target.value);
                      // Clear validation error when user types
                      if (validationErrors[questionSet[questionIndex].id]) {
                        const newErrors = { ...validationErrors };
                        delete newErrors[questionSet[questionIndex].id];
                        setValidationErrors(newErrors);
                        setError('');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentAnswer.trim() && !loading && !loadingQuestions) {
                        e.preventDefault();
                        handleNextQuestion();
                      }
                      if (e.key === 'Escape') {
                        setCurrentAnswer('');
                      }
                    }}
                    disabled={false} // Keep inputs editable during errors
                    aria-label={questionSet[questionIndex].text}
                    aria-required="true"
                    aria-invalid={!!validationErrors[questionSet[questionIndex].id]}
                    aria-describedby={validationErrors[questionSet[questionIndex].id] ? `error-${questionSet[questionIndex].id}` : undefined}
                  />
                )}
                {/* Validation Error Display */}
                {validationErrors[questionSet[questionIndex].id] && (
                  <div id={`error-${questionSet[questionIndex].id}`} className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <span aria-hidden="true">⚠️</span>
                    <span>{validationErrors[questionSet[questionIndex].id]}</span>
                  </div>
                )}
                {/* Character Counter */}
                {questionSet[questionIndex].type === 'text' && (
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {currentAnswer.length}/500 characters
                  </div>
                )}
                
                {/* Skip Banner */}
                {showSkipBanner && (
                  <SkipBanner
                    questionText={questionSet[questionIndex].text}
                    onSkip={handleSkipQuestion}
                    onCancel={() => setShowSkipBanner(false)}
                  />
                )}
              </div>
            )}

            {/* Show answers so far */}
            {(Object.keys(answers).length > 0 || skippedQuestions.size > 0) && (
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <div className="font-semibold text-gray-700 mb-1">
                  Answered: {Object.keys(answers).length}/{questionSet.length}
                  {skippedQuestions.size > 0 && ` (${skippedQuestions.size} skipped)`}
                </div>
                {Object.entries(answers).map(([key, value]) => {
                  const question = questionSet.find((q) => q.id === key);
                  const questionIndexForAnswer = questionSet.findIndex((q) => q.id === key);
                  return (
                    <div 
                      key={key} 
                      className="flex items-start gap-2 cursor-pointer hover:bg-purple-50 p-2 rounded transition-colors"
                      onClick={() => {
                        setQuestionIndex(questionIndexForAnswer);
                        setCurrentAnswer(value);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setQuestionIndex(questionIndexForAnswer);
                          setCurrentAnswer(value);
                        }
                      }}
                      aria-label={`Edit answer for ${question?.text}`}
                    >
                      <span className="font-semibold text-gray-700">{question?.text.split('?')[0] || key}:</span>
                      <span>{escapeHtml(value)}</span>
                      <span className="text-purple-600 ml-auto text-xs">✏️ Edit</span>
                    </div>
                  );
                })}
                {/* Show skipped questions */}
                {Array.from(skippedQuestions).map((skippedId) => {
                  const question = questionSet.find((q) => q.id === skippedId);
                  const questionIndexForSkipped = questionSet.findIndex((q) => q.id === skippedId);
                  if (!question || questionIndexForSkipped === -1) return null;
                  return (
                    <div 
                      key={skippedId}
                      className="flex items-start gap-2 cursor-pointer hover:bg-yellow-50 p-2 rounded transition-colors border border-yellow-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (questionIndexForSkipped >= 0 && questionIndexForSkipped < questionSet.length) {
                          // Remove from skipped set when user clicks to answer
                          const newSkipped = new Set(skippedQuestions);
                          newSkipped.delete(skippedId);
                          setSkippedQuestions(newSkipped);
                          
                          setQuestionIndex(questionIndexForSkipped);
                          setCurrentAnswer('');
                          setShowSkipBanner(false);
                          setError(''); // Clear any errors
                          setReadyToGenerate(false); // Reset ready state to allow answering
                          // Focus input after state updates
                          setTimeout(() => {
                            inputRef.current?.focus();
                            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (questionIndexForSkipped >= 0 && questionIndexForSkipped < questionSet.length) {
                            // Remove from skipped set when user clicks to answer
                            const newSkipped = new Set(skippedQuestions);
                            newSkipped.delete(skippedId);
                            setSkippedQuestions(newSkipped);
                            
                            setQuestionIndex(questionIndexForSkipped);
                            setCurrentAnswer('');
                            setShowSkipBanner(false);
                            setError(''); // Clear any errors
                            setReadyToGenerate(false); // Reset ready state to allow answering
                            // Focus input after state updates
                            setTimeout(() => {
                              inputRef.current?.focus();
                              inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                          }
                        }
                      }}
                      aria-label={`Answer skipped question: ${question.text}`}
                    >
                      <span className="font-semibold text-gray-700">{question.text.split('?')[0] || skippedId}:</span>
                      <span className="text-yellow-600 italic flex items-center gap-1">
                        <span>⚠️</span>
                        <span>Skipped</span>
                      </span>
                      <span className="text-purple-600 ml-auto text-xs">✏️ Answer</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {/* Primary CTA - Consolidated button */}
              <PrimaryCTA
                questionSetLength={questionSet.length}
                questionIndex={questionIndex}
                currentAnswer={currentAnswer}
                loadingQuestions={loadingQuestions}
                loading={loading}
                readyToGenerate={readyToGenerate}
                retryFunction={retryFunction}
                idea={idea}
                onStart={generateQuestions}
                onNext={handleNextQuestion}
                onRetry={async () => {
                  if (retryFunction) {
                    setError('');
                    const fn = retryFunction;
                    setRetryFunction(null);
                    await fn();
                  }
                }}
              />

              {/* Skip Question Button - shown when questions exist */}
              {questionSet.length > 0 && questionIndex < questionSet.length && !showSkipBanner && (
                <button
                  type="button"
                  onClick={() => setShowSkipBanner(true)}
                  disabled={loading || loadingQuestions}
                  className="px-6 py-4 border-2 border-yellow-300 text-yellow-700 bg-white rounded-xl hover:bg-yellow-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl disabled:shadow-lg"
                  aria-label="Skip this question"
                >
                  ⏭️ Skip
                </button>
              )}

              {/* Previous Question Button - shown when not on first question */}
              {questionSet.length > 0 && questionIndex > 0 && questionIndex < questionSet.length && (
                <button
                  type="button"
                  onClick={handlePreviousQuestion}
                  disabled={loading || loadingQuestions}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl disabled:shadow-lg"
                  aria-label="Go to previous question"
                >
                  ← Previous
                </button>
              )}

              {/* Skip Warning - shown when ready to generate with skips */}
              {readyToGenerate && skippedQuestions.size > 0 && (
                <div className="w-full">
                  <SkipWarning skippedCount={skippedQuestions.size} />
                </div>
              )}

              {/* Early Access Button */}
              <button
                type="button"
                onClick={() => setEarlyOpen(true)}
                disabled={loading || loadingQuestions}
                className="flex-1 px-6 py-4 border-2 border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl disabled:shadow-lg"
              >
                Sign up for early access
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl mb-8 animate-fade-in shadow-md">
            <p className="font-bold flex items-center gap-2 mb-1">
              <span>⚠️</span>
              <span>Oops!</span>
            </p>
            <p className="text-red-700 mb-3">{error}</p>
            {errorDetailsExpanded && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg text-sm text-red-800 font-mono">
                {error}
              </div>
            )}
            <div className="flex gap-2 items-center">
              {!retryFunction && (
                <button
                  onClick={() => setErrorDetailsExpanded(!errorDetailsExpanded)}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  {errorDetailsExpanded ? 'Hide' : 'View'} details
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Setup Steps */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-200/50 hover:shadow-2xl transition-all duration-300 animate-slide-in">
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-6 flex items-center gap-2">
                <span>⚡</span>
                <span>Top 5 Setup Steps</span>
              </h2>
              <ol className="space-y-5">
                {result.output.top5.map((step, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-purple-50/50 transition-all group">
                    <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                      {i + 1}
                    </span>
                    <div className="flex-1 text-gray-800 leading-relaxed pt-1.5">
                      <div className="font-semibold mb-1">{step.title}</div>
                      {step.cursorPrompt && (
                        <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                          <span className="font-semibold">Cursor:</span> {step.cursorPrompt}
                        </div>
                      )}
                      {step.command && (
                        <div className="text-sm text-gray-600 mt-2 font-mono bg-gray-900 text-green-400 p-2 rounded">
                          {step.command}
                        </div>
                      )}
                      {step.supabaseTip && (
                        <div className="text-sm text-blue-600 mt-2 bg-blue-50 p-2 rounded border border-blue-200">
                          <span className="font-semibold">💡 Supabase:</span> {step.supabaseTip}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Kanban Board */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-pink-200/50 hover:shadow-2xl transition-all duration-300 animate-slide-in">
              <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-6 flex items-center gap-2">
                <span>📋</span>
                <span>Your Project Kanban</span>
              </h2>
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 p-5 rounded-xl border border-gray-200 overflow-x-auto shadow-inner">
                {result.output.kanbanMarkdown}
              </pre>
            </div>

            {/* MVP Blueprint */}
            {result.output.blueprint && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300 animate-slide-in">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
                  <span>🗺️</span>
                  <span>MVP Blueprint</span>
                </h2>
                <div className="space-y-4">
                  {result.output.blueprint.epics.input && result.output.blueprint.epics.input.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Input Epics:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {result.output.blueprint.epics.input.map((epic, i) => (
                          <li key={i}>{epic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.output.blueprint.epics.output && result.output.blueprint.epics.output.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Output Epics:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {result.output.blueprint.epics.output.map((epic, i) => (
                          <li key={i}>{epic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.output.blueprint.epics.export && result.output.blueprint.epics.export.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Export Epics:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {result.output.blueprint.epics.export.map((epic, i) => (
                          <li key={i}>{epic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.output.blueprint.epics.history && result.output.blueprint.epics.history.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">History Epics:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {result.output.blueprint.epics.history.map((epic, i) => (
                          <li key={i}>{epic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <PDFDownload
                data={{
                  idea: result.idea,
                  questions: Object.entries(result.answers).map(([key, value]) => {
                    // Try to get stored question text from result, then current state, then fallback to key
                    const savedQuestionTexts = (result as any).questionTexts || {};
                    const questionText = savedQuestionTexts[key] || questionTexts[key] || key;
                    return {
                      q: questionText,
                      a: value,
                    };
                  }),
                  steps: result.output.top5.map((s) => ({
                    step: s.title,
                    command: s.command,
                    tip: s.supabaseTip,
                  })),
                  blueprint: {
                    epics: result.output.blueprint.epics,
                    kanbanMarkdown: result.output.kanbanMarkdown,
                  },
                }}
              />
              <button
                onClick={handleSave}
                disabled={isSaving || !result}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Sprint</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setEarlyOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>🎉</span>
                <span>Sign up for early access</span>
              </button>
            </div>

            {/* Save Success Message */}
            {savedId && (
              <div className="bg-green-50 border-2 border-green-300 text-green-800 px-6 py-4 rounded-xl shadow-md animate-fade-in">
                <p className="font-bold flex items-center gap-2 mb-2">
                  <span>✅</span>
                  <span>Saved!</span>
                </p>
                <p className="text-sm text-green-700 mb-2">Sprint ID: <code className="bg-green-100 px-2 py-1 rounded text-xs font-mono">{savedId}</code></p>
                <p className="text-sm">
                  <a href="/history" className="text-green-600 hover:text-green-700 underline font-semibold inline-flex items-center gap-1">
                    View in History →
                  </a>
                </p>
              </div>
            )}

            {/* Save Error Message */}
            {saveError && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl shadow-md animate-fade-in">
                <p className="font-bold flex items-center gap-2 mb-1">
                  <span>⚠️</span>
                  <span>Save Failed</span>
                </p>
                <p className="text-red-700">{saveError}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span>Generated with {result.model}</span>
                <span>·</span>
                <span>{new Date(result.timestamp).toLocaleString()}</span>
              </p>
            </div>

            {/* Try Again */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setResult(null);
                  setIdea('');
                  setAnswers({});
                  setQuestionTexts({});
                  setQuestionSet([]);
                  setQuestionIndex(0);
                  setReadyToGenerate(false);
                  setCurrentAnswer('');
                  setSavedId('');
                  setSaveError('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <span>←</span>
                <span>Try another idea</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Always Visible */}
      <footer className="text-center text-gray-600 py-6 px-4 mt-auto border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <p className="text-sm">
          Built with{' '}
          <span className="font-semibold text-gray-700">Next.js</span>,{' '}
          <span className="font-semibold text-gray-700">Supabase</span>, and{' '}
          <span className="font-semibold text-gray-700">OpenAI</span>
          {' · '}
          <a 
            href="https://github.com/Dave1524/coding_kickstarter" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 underline font-medium transition-colors"
          >
            View on GitHub
          </a>
        </p>
      </footer>

      {/* Early Access Modal */}
      <EarlyAccessModal
        open={earlyOpen}
        onClose={() => setEarlyOpen(false)}
        idea={result?.idea ?? idea}
        source={result ? 'results' : 'landing'}
      />
    </div>
  );
}

