import React from 'react';
import { Task } from '../../types';
import { Clock, Play, CheckCircle2, AlertOctagon, HelpCircle, ArrowUpRight } from 'lucide-react';

interface TodayExecutionPlanProps {
  tasks: Task[];
  onStart: (taskId: string) => void;
  onOpenBlockModal: (task: Task) => void;
}

export const TodayExecutionPlan: React.FC<TodayExecutionPlanProps> = ({
  tasks,
  onStart,
  onOpenBlockModal,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-status-info border border-blue-200">
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-status-healthy border border-emerald-200">
            Completed
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-status-attention border border-amber-200">
            Blocked
          </span>
        );
      case 'NEEDS_HELP':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-50 text-purple-700 border border-purple-200">
            Needs Help
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-secondary border border-border">
            Not Started
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="text-[10px] font-bold text-status-critical">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-semibold text-amber-600">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-medium text-slate-600">MEDIUM</span>;
      default:
        return <span className="text-[10px] text-slate-400">LOW</span>;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-primary tracking-tight">
            Today's Recommended Order
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Organized automatically around urgency, dependencies, and business impact. No manual sorting required.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-primary-subtle rounded-md">
          {tasks.length} Assigned Tasks
        </span>
      </div>

      <div className="divide-y divide-border/60">
        {tasks.map((task, index) => {
          const rank = task.rank || index + 1;
          const isNextBest = rank === 1;

          return (
            <div
              key={task.id}
              className={`py-3.5 px-3 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl transition-all ${
                isNextBest
                  ? 'bg-accent/5 border border-accent/20 my-1'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              {/* Left: Rank, Code, Title & Recommendation Reason */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    isNextBest
                      ? 'bg-accent text-white'
                      : 'bg-slate-100 text-secondary'
                  }`}
                >
                  {rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-secondary">
                      {task.task_code || `TSK-${1000 + rank}`}
                    </span>
                    <h4 className="text-xs font-semibold text-primary">
                      {task.title}
                    </h4>
                    {task.is_carried_forward && (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Carried Forward
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-secondary mt-0.5 line-clamp-1 max-w-xl">
                    {task.recommendation_reason || task.reasonSummary || task.description}
                  </p>
                </div>
              </div>

              {/* Right: Badges & Details */}
              <div className="flex items-center gap-4 text-xs ml-9 md:ml-0 shrink-0">
                <div className="w-16 text-right">
                  {getPriorityBadge(task.priority)}
                </div>

                <div className="w-20 text-center">
                  <span className="text-[11px] font-mono text-secondary">
                    {task.estimated_minutes} min
                  </span>
                </div>

                <div className="w-24 text-center">
                  {getStatusBadge(task.status)}
                </div>

                {task.status === 'NOT_STARTED' && (
                  <button
                    onClick={() => onStart(task.id)}
                    className="p-1.5 hover:bg-slate-200 text-primary rounded-md transition-colors"
                    title="Start task"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
