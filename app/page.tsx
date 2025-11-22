'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import PDFDownload from '@/components/PDFDownload';
import EarlyAccessModal from '@/components/EarlyAccessModal';
import PrimaryCTA from '@/components/PrimaryCTA';
import ProgressBar from '@/components/ProgressBar';
import LayerLabel from '@/components/LayerLabel';
import AIExpansionAlert from '@/components/AIExpansionAlert';
import SkipBanner from '@/components/SkipBanner';
import SkipWarning from '@/components/SkipWarning';
import DraftBanner from '@/components/DraftBanner';
import TaskList from '@/components/TaskList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Marquee } from '@/components/ui/marquee';
// Temporarily disabled Select import due to Turbopack module resolution issue
// TODO: Re-enable once Turbopack resolves @radix-ui/react-select properly
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { ThemeToggle } from '@/components/ThemeToggle';
import { validateAnswer, validateIdea } from '@/lib/validation';
import { useAutoSave, loadDraft, clearDraft } from '@/hooks/useAutoSave';
import { validateGenerateQuestionsResponse, validateCheckReadinessResponse, validateGenerateResponse } from '@/lib/api-validation';
import { sanitizeInput, checkRateLimit, escapeHtml } from '@/lib/security';
import { sanitizeInputSync } from '@/lib/security-client';
import { analytics } from '@/lib/analytics';
import { featureFlags } from '@/lib/feature-flags';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSkipBanner, setShowSkipBanner] = useState(false);
  const [retryFunction, setRetryFunction] = useState<(() => Promise<void>) | null>(null);
  const [questionsAddedCount, setQuestionsAddedCount] = useState(0);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [errorDetailsExpanded, setErrorDetailsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement | null>(null);

  // Auto-save draft
  useAutoSave(idea, answers, questionTexts, questionSet, questionIndex, skippedQuestions);

  // Check if all questions are processed (answered or skipped) and trigger readiness check
  useEffect(() => {
    if (questionSet.length > 0 && !loadingQuestions && !loading && !readyToGenerate) {
      const totalProcessed = Object.keys(answers).length + skippedQuestions.size;
      const allProcessed = totalProcessed >= questionSet.length;
      
      // If all questions processed, trigger readiness check
      if (allProcessed) {
        checkReadiness(answers);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, skippedQuestions, questionSet.length, loadingQuestions, loading, readyToGenerate]);

  // Load draft on mount - show banner instead of confirm dialog
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.idea) {
      setShowDraftBanner(true);
    }
  }, []);



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

    // Check if we've gone through all questions (answered + skipped = total)
    const totalProcessed = Object.keys(answers).length + newSkipped.size;
    const isLastQuestion = questionIndex === questionSet.length - 1;
    
    // If we've processed all questions OR we're on the last question, check readiness
    if (isLastQuestion || totalProcessed >= questionSet.length) {
      // All questions processed (either answered or skipped), check readiness
      checkReadiness(answers);
    } else {
      // Move to next question
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-full blur-sm opacity-30"></div>
                  <div className="relative bg-primary rounded-full p-2">
                    <span className="text-xl">🚀</span>
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                  Coding Kickstarter
                </span>
              </Link>
            </div>

            {/* Navigation Links - Center */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="#examples" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Examples
              </Link>
              <Link href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
              {featureFlags.showPricing && (
                <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              )}
            </div>

            {/* CTA Buttons - Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm rounded-xl"
                onClick={() => setEarlyOpen(true)}
              >
                Join up
              </Button>
              <ThemeToggle />
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-4 py-3 space-y-2">
                <Link 
                  href="#features" 
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link 
                  href="#examples" 
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Examples
                </Link>
                <Link 
                  href="/history" 
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </Link>
                {featureFlags.showPricing && (
                  <Link 
                    href="#pricing" 
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-end overflow-hidden">
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-6 space-y-2">
              <div className="headline-line-1">
                <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                  NO SETUP PARALYSIS
                </span>
              </div>
              <div className="headline-line-2">
                <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                  JUST CODE!
                </span>
              </div>
            </h1>
            <div className="mt-6 sm:mt-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto rounded-xl"
                onClick={() => {
                  document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Try it out
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div id="main-content" className="max-w-4xl mx-auto w-full flex-1 p-4 sm:p-6">
        {/* Draft Banner */}
        {showDraftBanner && (
          <DraftBanner
            onResume={handleDraftResume}
            onDiscard={handleDraftDiscard}
          />
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-12 animate-fade-in">
          <Card className="hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <Label htmlFor="idea" className="block text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <span>What do you want to build?</span>
              </Label>
              <Textarea
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
                placeholder="e.g., Todo app with login"
                className="min-h-[100px] resize-none"
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
                <div className="flex items-center justify-center gap-2 text-primary">
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
              <div className="mt-6 space-y-2 animate-fade-in" role="region" aria-label="Questionnaire" aria-live="polite">
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
                
                <Label htmlFor={`question-${questionSet[questionIndex].id}`} className="block text-lg font-semibold">
                  {questionSet[questionIndex].text}
                </Label>
                {questionSet[questionIndex].type === 'select' && questionSet[questionIndex].options ? (
                  <select
                    ref={(el) => { inputRef.current = el as HTMLSelectElement | null; }}
                    id={`question-${questionSet[questionIndex].id}`}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                  <Input
                    ref={(el) => { inputRef.current = el; }}
                    id={`question-${questionSet[questionIndex].id}`}
                    type="text"
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
                  <div id={`error-${questionSet[questionIndex].id}`} className="mt-2 text-sm text-destructive flex items-center gap-1" role="alert">
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
                      className="flex items-start gap-2 cursor-pointer hover:bg-primary/10 p-2 rounded transition-colors"
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
                      <span className="text-primary ml-auto text-xs">✏️ Edit</span>
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
                      <span className="text-primary ml-auto text-xs">✏️ Answer</span>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSkipBanner(true)}
                  disabled={loading || loadingQuestions}
                  className="w-full sm:w-auto rounded-xl font-bold py-4 px-6 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Skip this question"
                >
                  ⏭️ Skip
                </Button>
              )}

              {/* Previous Question Button - shown when not on first question */}
              {questionSet.length > 0 && questionIndex > 0 && questionIndex < questionSet.length && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={loading || loadingQuestions}
                  className="w-full sm:w-auto rounded-xl font-bold py-4 px-6 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Go to previous question"
                >
                  ← Previous
                </Button>
              )}

              {/* Skip Warning - shown when ready to generate with skips */}
              {readyToGenerate && skippedQuestions.size > 0 && (
                <div className="w-full">
                  <SkipWarning skippedCount={skippedQuestions.size} />
                </div>
              )}

              {/* Early Access Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setEarlyOpen(true)}
                disabled={loading || loadingQuestions}
                className="w-full sm:w-auto rounded-xl font-bold py-4 px-6 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign up for early access"
              >
                Sign up for early access
              </Button>
            </div>
            </CardContent>
          </Card>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border-2 border-destructive/30 text-destructive-foreground px-6 py-4 rounded-xl mb-8 animate-fade-in shadow-md">
            <p className="font-bold flex items-center gap-2 mb-1">
              <span>⚠️</span>
              <span>Oops!</span>
            </p>
            <p className="text-destructive mb-3">{error}</p>
            {errorDetailsExpanded && (
              <div className="mt-3 p-3 bg-destructive/15 rounded-lg text-sm text-destructive-foreground font-mono">
                {error}
              </div>
            )}
            <div className="flex gap-2 items-center">
              {!retryFunction && (
                <button
                  onClick={() => setErrorDetailsExpanded(!errorDetailsExpanded)}
                  className="text-sm text-destructive hover:text-destructive/80 underline"
                >
                  {errorDetailsExpanded ? 'Hide' : 'View'} details
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-fade-in" role="region" aria-label="Setup Steps" aria-live="polite">
            {/* Task List */}
            <TaskList
              tasks={result.output.top5.map((step, i) => {
                // Assign priority based on position
                let priority: 'High' | 'Medium' | 'Low';
                if (i < 2) {
                  priority = 'High';
                } else if (i < 4) {
                  priority = 'Medium';
                } else {
                  priority = 'Low';
                }

                // Build explanation: prefer supabaseTip (explains what/why), fallback to cursorPrompt
                let explanation = '';
                if (step.supabaseTip) {
                  explanation = step.supabaseTip;
                } else if (step.cursorPrompt) {
                  explanation = step.cursorPrompt;
                } else {
                  // Generate a generic description from the title
                  explanation = `Complete this step to move your project forward`;
                }

                // Get commands if available
                const commands = step.command ? [step.command] : undefined;

                return {
                  number: i + 1,
                  priority,
                  title: step.title,
                  explanation,
                  commands,
                };
              })}
            />

            {/* MVP Blueprint */}
            {result.output.blueprint && (
              <Card className="animate-slide-in">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <span>🗺️</span>
                    <span>MVP Blueprint</span>
                  </h2>
                  <div className="space-y-4">
                    {result.output.blueprint.epics.input && result.output.blueprint.epics.input.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Input Epics:</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {result.output.blueprint.epics.input.map((epic, i) => (
                            <li key={i}>{epic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.output.blueprint.epics.output && result.output.blueprint.epics.output.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Output Epics:</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {result.output.blueprint.epics.output.map((epic, i) => (
                            <li key={i}>{epic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.output.blueprint.epics.export && result.output.blueprint.epics.export.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Export Epics:</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {result.output.blueprint.epics.export.map((epic, i) => (
                            <li key={i}>{epic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.output.blueprint.epics.history && result.output.blueprint.epics.history.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">History Epics:</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {result.output.blueprint.epics.history.map((epic, i) => (
                            <li key={i}>{epic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              {/* Row 1: PDF Download and Save Sprint */}
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
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
                    steps: result.output.top5.map((s, i) => {
                      // Assign priority based on position
                      let priority: 'High' | 'Medium' | 'Low';
                      if (i < 2) {
                        priority = 'High';
                      } else if (i < 4) {
                        priority = 'Medium';
                      } else {
                        priority = 'Low';
                      }

                      // Build explanation: prefer supabaseTip (explains what/why), fallback to cursorPrompt
                      let explanation = '';
                      if (s.supabaseTip) {
                        explanation = s.supabaseTip;
                      } else if (s.cursorPrompt) {
                        explanation = s.cursorPrompt;
                      } else {
                        explanation = `Complete this step to move your project forward`;
                      }

                      return {
                        step: s.title,
                        priority,
                        explanation,
                        command: s.command,
                      };
                    }),
                    blueprint: {
                      epics: result.output.blueprint.epics,
                    },
                  }}
                />
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !result}
                  variant="default"
                  className="w-full sm:w-auto rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Save sprint to history"
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
                </Button>
              </div>
              
              {/* Row 2: Early Access Sign Up */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setEarlyOpen(true)}
                  variant="default"
                  className="w-full sm:w-auto rounded-xl"
                  aria-label="Sign up for early access"
                >
                  <span>🎉</span>
                  <span>Sign up for early access</span>
                </Button>
              </div>
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
              <div className="bg-destructive/10 border-2 border-destructive/30 text-destructive-foreground px-6 py-4 rounded-xl shadow-md animate-fade-in">
                <p className="font-bold flex items-center gap-2 mb-1">
                  <span>⚠️</span>
                  <span>Save Failed</span>
                </p>
                <p className="text-destructive">{saveError}</p>
              </div>
            )}


            {/* Try Again */}
            <div className="text-center pt-4">
              <Button
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
                variant="outline"
                className="w-full sm:w-auto rounded-xl"
                aria-label="Start over with a new idea"
              >
                <span>←</span>
                <span>Try another idea</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <section 
        id="features" 
        className="w-full py-20 sm:py-24 bg-background overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to kickstart your coding journey
            </p>
          </div>
        </div>
        <div className="w-screen relative left-1/2 -translate-x-1/2 space-y-6">
          {/* Row 1: Left to Right Marquee */}
          <Marquee direction="left" duration={30} pauseOnHover className="[--gap:1.5rem]">
            <Card className="border-border hover:shadow-lg transition-shadow shrink-0 w-[280px] md:w-[320px]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <CardTitle>AI-Powered Setup Guides</CardTitle>
                <CardDescription>
                  Generate beginner-friendly setup steps for any project idea. No more setup paralysis—just code!
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow shrink-0 w-[280px] md:w-[320px]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <CardTitle>MVP Output</CardTitle>
                <CardDescription>
                  Get structured MVP blueprints with EPICs and Features. Organize your project roadmap and stay focused on what matters.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow shrink-0 w-[280px] md:w-[320px]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <CardTitle>PDF Export</CardTitle>
                <CardDescription>
                  Download your setup guides and plans as beautiful PDFs. Share with your team or keep for reference.
                </CardDescription>
              </CardHeader>
            </Card>
          </Marquee>

          {/* Row 2: Right to Left Marquee */}
          <Marquee direction="right" duration={30} pauseOnHover className="[--gap:1.5rem]">
            <Card className="border-border hover:shadow-lg transition-shadow shrink-0 w-[280px] md:w-[320px]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <CardTitle>Smart Questions</CardTitle>
                <CardDescription>
                  Our AI asks clarifying questions to understand your project better and generate personalized guides.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow shrink-0 w-[280px] md:w-[320px]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <CardTitle>Top 5 Setup Steps</CardTitle>
                <CardDescription>
                  Get prioritized setup steps with Cursor prompts, terminal commands, and Supabase tips included.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow shrink-0 w-[280px] md:w-[320px]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <span className="text-2xl">💾</span>
                </div>
                <CardTitle>Save & History</CardTitle>
                <CardDescription>
                  Save your sprints and access them anytime. Build a library of your project plans and ideas.
                </CardDescription>
              </CardHeader>
            </Card>
          </Marquee>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get from idea to code in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <CardTitle className="text-xl">Enter Your Idea</CardTitle>
                <CardDescription>
                  Tell us what you want to build. It can be anything—a todo app, chat app, e-commerce store, or something completely unique.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <CardTitle className="text-xl">Answer Questions</CardTitle>
                <CardDescription>
                  Our AI asks 3-7 clarifying questions to understand your project better. Skip questions you're unsure about—we'll work with what you provide.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <CardTitle className="text-xl">Get Your Guide</CardTitle>
                <CardDescription>
                  Receive your personalized setup guide with top 5 steps, Kanban board, MVP blueprint, and PDF export option. Start coding immediately!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="w-full py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                Example Projects
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what you can build with Coding Kickstarter
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Todo App for 100 Users</CardTitle>
                <CardDescription>
                  Build a scalable todo application with user authentication, task management, and real-time updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    User authentication & authorization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    CRUD operations for tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Database schema & migrations
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Chat App with Real-Time Messaging</CardTitle>
                <CardDescription>
                  Create a real-time chat application with WebSocket support, message history, and user presence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    WebSocket integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Message persistence
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    User presence indicators
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>E-Commerce Store with Payments</CardTitle>
                <CardDescription>
                  Launch an e-commerce platform with product catalog, shopping cart, and secure payment processing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Product management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Shopping cart functionality
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Payment gateway integration
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Weather App Using Public APIs</CardTitle>
                <CardDescription>
                  Build a weather application that fetches data from public APIs and displays forecasts beautifully.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    API integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Location-based data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Responsive UI design
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history" className="w-full py-20 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                Your Project History
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Access all your saved sprints and project plans in one place
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" asChild>
              <Link href="/history">View History →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {featureFlags.showPricing && (
        <section id="pricing" className="w-full py-20 sm:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                  Simple Pricing
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start building today—no credit card required
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/forever</span>
                  </div>
                  <CardDescription className="mt-4">
                    Perfect for getting started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Unlimited project ideas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>AI-generated setup guides</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>PDF export</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Save up to 10 sprints</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" asChild>
                    <Link href="#main-content">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-border border-2 border-primary/50 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-4">
                    For serious developers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Unlimited saved sprints</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Priority AI processing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Advanced Kanban features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Team collaboration</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" asChild>
                    <Link href="#join">Upgrade to Pro</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                  <CardDescription className="mt-4">
                    For teams and organizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Custom AI models</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>SLA guarantee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>On-premise deployment</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-xl" variant="outline" asChild>
                    <Link href="#join">Contact Sales</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer - Always Visible */}
      <footer className="text-center text-muted-foreground py-6 px-4 mt-auto border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <p className="text-sm">
          © Coding Kickstarter 2025
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

