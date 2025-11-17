'use client';

import CopyButton from './CopyButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  number: number;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  explanation: string;
  commands?: string[];
}

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    }
  };

  return (
    <Card className="animate-slide-in">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2">
          <span>✅</span>
          <span>Your 5 Setup Wins</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.number} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-input text-primary focus:ring-ring cursor-pointer flex-shrink-0"
                  aria-label={`Mark "${task.title}" as complete`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Priority */}
                  <div className="flex items-start gap-3 mb-2 flex-wrap">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#6B46C1] to-[#9F7AEA] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                      {task.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg leading-tight">
                        {task.title}
                      </h3>
                    </div>
                    <span
                      className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Explanation */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3 ml-11">
                    → {task.explanation}
                  </p>

                  {/* Commands */}
                  {task.commands && task.commands.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {task.commands.map((cmd, idx) => (
                        <div key={idx} className="relative">
                          <pre className="text-sm font-mono bg-gray-100 dark:bg-gray-800 text-foreground p-4 rounded-md overflow-x-auto border border-border">
                            {cmd}
                          </pre>
                          <CopyButton text={cmd} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

