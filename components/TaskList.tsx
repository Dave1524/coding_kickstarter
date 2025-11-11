'use client';

import CopyButton from './CopyButton';

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
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-200/50 hover:shadow-2xl transition-all duration-300 animate-slide-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-6 flex items-center gap-2">
        <span>✅</span>
        <span>Your 5 Setup Wins</span>
      </h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.number}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-purple-50/50 transition-all group border border-gray-200"
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer flex-shrink-0"
              aria-label={`Mark "${task.title}" as complete`}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Priority */}
              <div className="flex items-start gap-3 mb-2 flex-wrap">
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                  {task.number}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
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
              <p className="text-gray-600 text-sm leading-relaxed mb-3 ml-11">
                → {task.explanation}
              </p>

              {/* Commands */}
              {task.commands && task.commands.length > 0 && (
                <div className="ml-11 space-y-2">
                  {task.commands.map((cmd, idx) => (
                    <div key={idx} className="relative">
                      <pre className="text-sm font-mono bg-gray-900 text-green-400 p-3 pr-10 rounded overflow-x-auto">
                        {cmd}
                      </pre>
                      <CopyButton text={cmd} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

