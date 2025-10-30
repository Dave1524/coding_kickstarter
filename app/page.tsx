'use client';

import { useState } from 'react';
import PDFDownload from '@/components/PDFDownload';

interface GenerateResult {
  provider: string;
  model: string;
  idea: string;
  questions: string[];
  steps: string[];
  kanbanMarkdown: string;
  blueprint?: {
    epics?: string[];
  };
  timestamp: string;
}

export default function Home() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState('');
  const [saveError, setSaveError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!idea.trim()) {
      setError('Please enter a project idea before generating a guide.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setSavedId('');
    setSaveError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.hint || 'Failed to generate');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while generating your guide.');
    } finally {
      setLoading(false);
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
          questions: result.questions,
          top_steps: result.steps,
          blueprint: {
            epics: result.blueprint?.epics ?? [],
            kanbanMarkdown: result.kanbanMarkdown,
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
            Tell us your project idea and we'll generate a beginner-friendly setup guide powered by AI.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Powered by AI
            </span>
          </div>
        </header>

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
              placeholder="e.g., Todo app for 100 users, chat app for teams, weather dashboard..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none font-sans"
              rows={4}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg shadow-lg hover:shadow-xl disabled:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating your guide...
                </span>
              ) : (
                'Generate Setup Guide'
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl mb-8 animate-fade-in shadow-md">
            <p className="font-bold flex items-center gap-2 mb-1">
              <span>⚠️</span>
              <span>Oops!</span>
            </p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Questions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300 animate-slide-in">
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
                <span>❓</span>
                <span>Questions to Consider</span>
              </h2>
              <ul className="space-y-4">
                {result.questions.map((q, i) => (
                  <li key={q} className="flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-800 leading-relaxed flex-1">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Setup Steps */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-200/50 hover:shadow-2xl transition-all duration-300 animate-slide-in">
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-6 flex items-center gap-2">
                <span>⚡</span>
                <span>Top 5 Setup Steps</span>
              </h2>
              <ol className="space-y-5">
                {result.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-4 p-4 rounded-xl hover:bg-purple-50/50 transition-all group">
                    <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                      {i + 1}
                    </span>
                    <div className="flex-1 text-gray-800 leading-relaxed pt-1.5">{step}</div>
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
                {result.kanbanMarkdown}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <PDFDownload
                data={{
                  idea: result.idea,
                  questions: result.questions.map((q) => ({ q, a: '' })),
                  steps: result.steps.map((s) => ({ step: s })),
                  blueprint: { epics: result.blueprint?.epics ?? [], kanbanMarkdown: result.kanbanMarkdown },
                }}
              />
              <button
                onClick={handleSave}
                disabled={isSaving || !result}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
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
                  '💾 Save Sprint'
                )}
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
                  setSavedId('');
                  setSaveError('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-purple-600 hover:text-purple-800 font-semibold underline transition-colors inline-flex items-center gap-1"
              >
                ← Try another idea
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
    </div>
  );
}
