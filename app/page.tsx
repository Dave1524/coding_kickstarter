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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 pt-8">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🚀 Coding Kickstarter
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Tell us your project idea and we will return a beginner-friendly setup guide powered by AI. 🤖
          </p>
        </header>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-purple-200">
            <label htmlFor="idea" className="block text-lg font-semibold text-gray-800 mb-3">
              💡 What do you want to build?
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., Todo app for 100 users, chat app for teams, weather dashboard..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
              rows={3}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              {loading ? 'Generating your guide...' : 'Generate Setup Guide'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl mb-8">
            <p className="font-bold">⚠️ Oops!</p>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Questions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Questions to Consider</h2>
              <ul className="space-y-3">
                {result.questions.map((q, i) => (
                  <li key={q} className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">{i + 1}.</span>
                    <span className="text-gray-800">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Setup Steps */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-600 mb-4">Top 5 Setup Steps</h2>
              <ol className="space-y-4">
                {result.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 text-gray-800 leading-relaxed">{step}</div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Kanban Board */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-pink-200">
              <h2 className="text-2xl font-bold text-pink-600 mb-4">Your Project Kanban</h2>
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-300 overflow-x-auto">
                {result.kanbanMarkdown}
              </pre>
            </div>

            {/* PDF Download Button */}
            <div className="flex justify-center">
              <PDFDownload
                data={{
                  idea: result.idea,
                  questions: result.questions.map((q) => ({ q, a: '' })),
                  steps: result.steps.map((s) => ({ step: s })),
                  blueprint: { epics: result.blueprint?.epics ?? [], kanbanMarkdown: result.kanbanMarkdown },
                }}
              />
            </div>

            {/* Save Sprint Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={isSaving || !result}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isSaving ? 'Saving...' : 'Save Sprint'}
              </button>
            </div>

            {/* Save Success Message */}
            {savedId && (
              <div className="bg-green-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl">
                <p className="font-bold">✅ Saved!</p>
                <p className="text-sm">Sprint ID: {savedId}</p>
                <p className="text-sm">
                  <a href="/history" className="text-green-600 hover:underline font-semibold">
                    View in History →
                  </a>
                </p>
              </div>
            )}

            {/* Save Error Message */}
            {saveError && (
              <div className="bg-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl">
                <p className="font-bold">⚠️ Save Failed</p>
                <p>{saveError}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="text-center text-sm text-gray-500">
              <p>
                Generated with {result.model} · {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Try Again */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setIdea('');
                  setSavedId('');
                  setSaveError('');
                }}
                className="text-purple-600 hover:text-purple-800 font-semibold underline"
              >
                Try another idea
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!result && (
          <footer className="text-center text-gray-600 mt-16">
            <p className="text-sm">
              Built with Next.js, Supabase, and OpenAI ·{' '}
              <a href="https://github.com/Dave1524/coding_kickstarter" className="ml-1 text-purple-600 hover:underline">
                View on GitHub
              </a>
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
