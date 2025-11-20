import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

type RawSprint = {
  id: string;
  idea: string | null;
  questions?: unknown;
  top_steps?: unknown;
  steps?: unknown;
  blueprint?: unknown;
  output_json?: unknown;
  created_at?: string | null;
};

type NormalizedSprint = {
  id: string;
  idea: string;
  createdAt: string;
  questions: string[];
  topSteps: string[];
  epics: string[];
  kanbanMarkdown: string;
};

function normalizeSprint(row: RawSprint): NormalizedSprint {
  const fallback = (row.output_json ?? {}) as Record<string, unknown>;
  const blueprintValue = (row.blueprint ?? fallback?.blueprint ?? {}) as Record<string, unknown>;

  const questionsSource = Array.isArray(row.questions)
    ? row.questions
    : Array.isArray(fallback?.questions)
      ? (fallback.questions as unknown[])
      : [];

  const stepsSource = Array.isArray(row.top_steps)
    ? row.top_steps
    : Array.isArray(fallback?.steps)
      ? (fallback.steps as unknown[])
      : [];

  const epicsSource = Array.isArray(blueprintValue?.epics)
    ? blueprintValue.epics
    : Array.isArray((fallback?.blueprint as Record<string, unknown> | undefined)?.epics)
      ? ((fallback?.blueprint as Record<string, unknown>).epics as unknown[])
      : [];

  const kanbanMarkdownValue =
    typeof blueprintValue?.kanbanMarkdown === 'string'
      ? (blueprintValue.kanbanMarkdown as string)
      : typeof fallback?.kanbanMarkdown === 'string'
        ? (fallback.kanbanMarkdown as string)
        : typeof (fallback?.blueprint as Record<string, unknown> | undefined)?.kanbanMarkdown === 'string'
          ? (((fallback?.blueprint as Record<string, unknown>).kanbanMarkdown as string))
          : '';

  return {
    id: row.id,
    idea: row.idea?.trim() || 'Untitled sprint',
    createdAt: row.created_at || '',
    questions: questionsSource
      .map((item) => (typeof item === 'string' ? item : null))
      .filter((item): item is string => Boolean(item)),
    topSteps: stepsSource
      .map((item) => (typeof item === 'string' ? item : null))
      .filter((item): item is string => Boolean(item)),
    epics: epicsSource
      .map((item) => (typeof item === 'string' ? item : null))
      .filter((item): item is string => Boolean(item)),
    kanbanMarkdown: typeof kanbanMarkdownValue === 'string' ? kanbanMarkdownValue : '',
  };
}

async function getSprints(): Promise<NormalizedSprint[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('generated_sprints')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[history] Failed to load sprints from Supabase:', error);
    return [];
  }

  return (data ?? []).map((row) => normalizeSprint(row as RawSprint));
}

function formatTimestamp(value: string) {
  if (!value) return 'Unknown date';
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function HistoryPage() {
  const sprints = await getSprints();

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Sprint History</h1>
            <p className="text-muted-foreground mt-2">
              Review everything you have generated. Each sprint captures the idea, clarifying questions, setup steps,
              and Kanban board.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition"
          >
            ← Back to Generator
          </Link>
        </div>

        {sprints.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">
            <p className="text-lg font-semibold">No sprints saved yet.</p>
            <p className="mt-2">Generate a new plan on the home page and save it to see it appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sprints.map((sprint) => (
              <article key={sprint.id} className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-border pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{sprint.idea}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Saved: {formatTimestamp(sprint.createdAt)}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1 text-sm font-semibold">
                    {sprint.topSteps.length} steps · {sprint.questions.length} questions
                  </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Clarifying Questions</h3>
                    <ul className="space-y-2 text-foreground">
                      {sprint.questions.length > 0 ? (
                        sprint.questions.map((question, index) => (
                          <li key={`${sprint.id}-question-${index}`} className="flex gap-3">
                            <span className="font-medium text-primary">{index + 1}.</span>
                            <span>{question}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">No questions were saved for this sprint.</li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Top Setup Steps</h3>
                    <ol className="space-y-2 text-foreground">
                      {sprint.topSteps.length > 0 ? (
                        sprint.topSteps.map((step, index) => (
                          <li key={`${sprint.id}-step-${index}`} className="flex gap-3">
                            <span className="font-medium text-primary">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">No steps were saved for this sprint.</li>
                      )}
                    </ol>
                  </div>
                </div>

                {sprint.epics.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold text-accent">MVP Epics</h3>
                    <ul className="space-y-2 text-foreground">
                      {sprint.epics.map((epic, index) => (
                        <li key={`${sprint.id}-epic-${index}`} className="flex gap-3">
                          <span className="font-medium text-accent">{index + 1}.</span>
                          <span>{epic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sprint.kanbanMarkdown && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Kanban Board</h3>
                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-foreground bg-muted border border-border rounded-xl p-4 overflow-x-auto">
                      {sprint.kanbanMarkdown}
                    </pre>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
