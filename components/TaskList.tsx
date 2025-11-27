'use client';

import { useRef } from 'react';
import CopyButton from './CopyButton';
import CursorDeepLinkButton from './CursorDeepLinkButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTaskCompletion } from '@/hooks/useTaskCompletion';
import { PRIORITY_LABELS, type Priority } from '@/lib/command-config';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export interface Task {
  number: number;
  priority: Priority;
  title: string;
  explanation: string;
  why?: string;
  commands?: string[];
  expectedOutput?: string[];
  where?: 'terminal' | 'cursor';
  isCompleted?: boolean;
  autoChecked?: boolean;
  estimatedTime?: string;
  isFirstStep?: boolean;
}

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <Card className="animate-slide-in">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2">
          <span>⚡</span>
          <span>First 5 Commands to Start Your Project</span>
        </CardTitle>
        <CardDescription className="text-base mt-2">
          Click the button to run each command directly in Cursor, or copy to run manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task, index) => (
          <TaskItem 
            key={task.number} 
            task={{
              ...task,
              isFirstStep: index === 0, // First task is always the "magic" one
              estimatedTime: task.estimatedTime || getDefaultEstimatedTime(task.commands?.[0] || ''),
            }} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Get default estimated time based on command type
 */
function getDefaultEstimatedTime(command: string): string {
  const cmd = command.toLowerCase();
  if (cmd.includes('create-next-app')) return '~45 seconds';
  if (cmd.includes('npm run dev') || cmd.includes('yarn dev')) return '~5 seconds';
  if (cmd.includes('supabase init')) return '~2 minutes';
  if (cmd.includes('npm install') || cmd.includes('yarn') || cmd.includes('pnpm install')) return '~30 seconds';
  return '~15 seconds';
}

/**
 * Get priority color classes
 */
function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-500/20 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
    case 'recommended':
      return 'bg-amber-500/20 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700';
    case 'optional':
      return 'bg-emerald-500/20 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700';
  }
}

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  const taskId = `task-${task.number}`;
  const { isCompleted, isAutoChecked, toggleCompletion } = useTaskCompletion(taskId);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP animation for checkbox completion
  useGSAP(() => {
    if (isCompleted && checkboxRef.current) {
      gsap.fromTo(
        checkboxRef.current,
        { scale: 1 },
        {
          scale: 1.2,
          duration: 0.2,
          ease: 'back.out(2)',
          yoyo: true,
          repeat: 1,
        }
      );
    }
  }, { scope: cardRef, dependencies: [isCompleted] });

  // GSAP entry animation
  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: (task.number - 1) * 0.1,
        }
      );
    }
  }, { scope: cardRef, dependencies: [] });

  const handleCheckboxChange = () => {
    toggleCompletion();
  };

  const command = task.commands?.[0];
  const hasCommand = command && command.length > 0;

  return (
    <Card 
      ref={cardRef} 
      className={cn(
        "border-border invisible relative overflow-hidden transition-all duration-300",
        isCompleted && "opacity-60 bg-muted/30",
        task.isFirstStep && "ring-2 ring-primary/30 shadow-lg"
      )}
    >
      {/* Priority Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className={cn(
            "px-3 py-1 text-xs font-bold rounded-full border",
            getPriorityColor(task.priority)
          )}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Step Number Circle */}
          <div className="flex flex-col items-center gap-2 mt-1">
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                task.isFirstStep 
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30" 
                  : "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
              )}
            >
              {task.number}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-24">
            {/* Title */}
            <h3 className="font-semibold text-foreground text-lg leading-tight mb-2">
              {task.title}
            </h3>

            {/* Single explanation line */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {task.explanation}
            </p>

            {/* Command Block */}
            {hasCommand && (
              <div className="space-y-3">
                <div className="relative group">
                  <pre className="text-sm font-mono bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 pr-12 rounded-lg overflow-x-auto border border-zinc-700">
                    <code>{command}</code>
                  </pre>
                  {/* Secondary Copy Button - positioned top right of code block */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={command} variant="secondary" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Primary: Cursor Deep Link Button */}
                  <CursorDeepLinkButton
                    command={command}
                    isFirstStep={task.isFirstStep}
                    stepNumber={task.number}
                  />
                  
                  {/* Secondary: Copy Button */}
                  <CopyButton 
                    text={command} 
                    variant="outline"
                    showLabel 
                  />
                </div>

                {/* Reassurance Text */}
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Takes {task.estimatedTime || '~30 seconds'}
                  {task.isFirstStep && ' · Cursor will open your project automatically'}
                </p>
              </div>
            )}

            {/* Manual Completion Checkbox */}
            <div className="mt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  checked={isCompleted}
                  onChange={handleCheckboxChange}
                  className={cn(
                    "w-5 h-5 rounded border-2 border-input text-primary focus:ring-ring cursor-pointer transition-all",
                    isCompleted && "border-primary bg-primary"
                  )}
                  aria-label={`Mark "${task.title}" as complete`}
                />
                <span className={cn(
                  "text-sm transition-colors",
                  isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
                )}>
                  {isCompleted ? 'Completed' : 'Mark as complete'}
                </span>
                {isAutoChecked && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Auto-detected
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
