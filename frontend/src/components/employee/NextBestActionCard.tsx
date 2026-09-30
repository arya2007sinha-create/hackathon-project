import React, { useState } from 'react';
import { Task } from '../../types';
import {
  Play,
  Pause,
  CheckCircle,
  AlertOctagon,
  HelpCircle,
  Clock,
  GitBranch,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface NextBestActionCardProps {
  task: Task | null;
  onStart: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onOpenBlockModal: (task: Task) => void;
  onOpenHelpModal: (task: Task) => void;
  isLoading?: boolean;
}

export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({
  task,
  onStart,
  onPause,
  onComplete,
  onOpenBlockModal,
  onOpenHelpModal,
  isLoading = false,
}) => {
  const [showReasoning, setShowReasoning] = useState<boolean>(true);

  if (!task) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-card">
        <CheckCircle className="w-12 h-12 text-status-healthy mx-auto mb-3" />
        <h3 className="text-base font-semibold text-primary">You're all caught up.</h3>
        <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
          No pending prioritized actions require immediate execution right now.
        </p>
      </div>
    );
  }

  const isStarted = task.status === 'IN_PROGRESS';
  const isBlocked = task.status === 'BLOCKED';

  return (
    <div className="bg-card border border-border rounded-2xl p-7 shadow-card relative overflow-hidden transition-all">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-accent">
            Next Best Action
          </span>
          {task.isManagerOverridden && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
              Manager Priority Override
            </span>
          )}
        </div>

        {/* Priority badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold tracking-wide rounded-md bg-red-50 text-status-critical border border-status-criticalBorder uppercase">
            {task.priority}
          </span>
        </div>
      </div>

      {/* Task Heading */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2.5 mb-1.5">
          <span className="text-xs font-mono font-medium text-secondary">
            {task.task_code || 'TSK-1006'}
          </span>
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            {task.title}
          </h2>
        </div>
        <p className="text-xs text-secondary leading-relaxed max-w-3xl">
          {task.description}
        </p>
      </div>

      {/* Key Metadata Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-border mb-6">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-secondary" />
          <div>
            <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">Deadline</p>
            <p className="font-semibold text-primary">Due today (5:00 PM)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-secondary" />
          <div>
            <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">Estimated Effort</p>
            <p className="font-semibold text-primary">2h 15m estimated</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs col-span-2 sm:col-span-1">
          <GitBranch className="w-4 h-4 text-accent" />
          <div>
            <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">Downstream Impact</p>
            <p className="font-semibold text-accent">
              Blocking {task.blocking_count || 3} downstream tasks
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {!isStarted ? (
          <button
            onClick={() => onStart(task.id)}
            disabled={isLoading || isBlocked}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START TASK</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => onComplete(task.id)}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-status-healthy hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>MARK COMPLETE</span>
            </button>

            <button
              onClick={() => onPause(task.id)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-primary text-xs font-medium rounded-xl transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE</span>
            </button>
          </>
        )}

        <button
          onClick={() => onOpenBlockModal(task)}
          disabled={isLoading || isBlocked}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-medium rounded-xl transition-all"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Mark Blocked</span>
        </button>

        <button
          onClick={() => onOpenHelpModal(task)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-border text-secondary hover:text-primary hover:bg-slate-50 text-xs font-medium rounded-xl transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Request Help</span>
        </button>
      </div>

      {/* WHY THIS TASK? Explainable Business Factors */}
      <div className="bg-slate-50/80 border border-border/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Why This Task?
            </span>
            <span className="text-[10px] text-secondary">
              (Autonomous Multi-Factor Priority Engine)
            </span>
          </div>
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="text-xs font-medium text-secondary hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span>{showReasoning ? 'Hide reasoning' : 'View reasoning'}</span>
            {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showReasoning && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-status-critical mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Critical business impact</p>
                  <p className="text-[11px] text-secondary">
                    Core payment gateway fails under concurrency; direct customer SLA risk.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-status-critical mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Deadline approaching</p>
                  <p className="text-[11px] text-secondary">
                    Targeted for sprint integration today by 5:00 PM.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Blocking 3 downstream tasks</p>
                  <p className="text-[11px] text-secondary">
                    Blocks API Testing, Reconciliation Service, and Production Release.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-status-info mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Manager-defined priority</p>
                  <p className="text-[11px] text-secondary">
                    Sarah Chen flagged this as top critical path for Sprint 26.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
