import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { employeeApi } from '../../api/employee.api';
import { EmployeeDashboardData, Task } from '../../types';
import { NextBestActionCard } from '../../components/employee/NextBestActionCard';
import { TodayExecutionPlan } from '../../components/employee/TodayExecutionPlan';
import { BlockTaskModal } from '../../components/employee/BlockTaskModal';
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Bell,
  Sparkles,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTaskToBlock, setSelectedTaskToBlock] = useState<Task | null>(null);
  const [isBlockingModalOpen, setIsBlockingModalOpen] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const fetchDashboard = async () => {
    try {
      const res = await employeeApi.getDashboard();
      setData(res);
    } catch {
      console.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStartTask = async (taskId: string) => {
    setIsActionLoading(true);
    try {
      await employeeApi.updateStatus(taskId, 'IN_PROGRESS');
      await fetchDashboard();
    } catch {
      alert('Failed to start task');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePauseTask = async (taskId: string) => {
    setIsActionLoading(true);
    try {
      await employeeApi.updateStatus(taskId, 'NOT_STARTED');
      await fetchDashboard();
    } catch {
      alert('Failed to pause task');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setIsActionLoading(true);
    try {
      await employeeApi.updateStatus(taskId, 'COMPLETED');
      await fetchDashboard();
    } catch {
      alert('Failed to complete task');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBlockTaskSubmit = async (formData: {
    blockedCategory: string;
    blockedReason: string;
    requestSupport: boolean;
  }) => {
    if (!selectedTaskToBlock) return;
    setIsActionLoading(true);
    try {
      await employeeApi.blockTask(
        selectedTaskToBlock.id,
        formData.blockedCategory,
        formData.blockedReason,
        formData.requestSupport
      );
      setIsBlockingModalOpen(false);
      await fetchDashboard();
    } catch {
      alert('Failed to block task');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-secondary">Analyzing operational context & ranking execution plan...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-primary">Unable to load today's work.</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const { employee, nextBestAction, executionPlan, progress, yesterday, blockers, notifications } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Good morning, {employee.name}
          </h1>
          <p className="text-xs text-secondary mt-1">
            "Your work has already been organized around urgency, impact and dependencies."
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-slate-50 text-secondary hover:text-primary rounded-lg text-xs font-medium transition-colors self-start sm:self-auto"
          title="Refresh priorities"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Recommendations</span>
        </button>
      </div>

      {/* 2. Flagship: Next Best Action Card */}
      <NextBestActionCard
        task={nextBestAction}
        onStart={handleStartTask}
        onPause={handlePauseTask}
        onComplete={handleCompleteTask}
        onOpenBlockModal={(task) => {
          setSelectedTaskToBlock(task);
          setIsBlockingModalOpen(true);
        }}
        onOpenHelpModal={(task) => {
          setSelectedTaskToBlock(task);
          setIsBlockingModalOpen(true);
        }}
        isLoading={isActionLoading}
      />

      {/* 3. Progress, Remaining Workload & Yesterday Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Progress */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              Today's Progress
            </span>
            <TrendingUp className="w-4 h-4 text-status-healthy" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{progress.progressPercent}%</span>
            <span className="text-xs text-secondary">
              ({progress.completedTasks} of {progress.totalTasks} completed)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-status-healthy h-full transition-all duration-300"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Remaining Workload */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              Remaining Workload
            </span>
            <Clock className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {progress.formattedRemainingTime}
            </span>
            <span className="text-xs text-secondary">estimated focus time</span>
          </div>
          <p className="text-[11px] text-secondary mt-3">
            Active in progress: <strong>{progress.inProgressTasks} task</strong>
          </p>
        </div>

        {/* Yesterday's Summary */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              Yesterday Context
            </span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-primary">
            <div>
              <p className="text-[10px] text-secondary font-normal uppercase">Completed</p>
              <p className="text-base font-bold text-status-healthy">{yesterday.completed}</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className="text-[10px] text-secondary font-normal uppercase">Incomplete</p>
              <p className="text-base font-bold text-secondary">{yesterday.incomplete}</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className="text-[10px] text-secondary font-normal uppercase">Carried Over</p>
              <p className="text-base font-bold text-amber-600">{yesterday.carriedForward}</p>
            </div>
          </div>
          <p className="text-[10px] text-secondary mt-2 leading-tight">
            {yesterday.message}
          </p>
        </div>
      </div>

      {/* 4. Today's Recommended Order (Execution Plan) */}
      <TodayExecutionPlan
        tasks={executionPlan}
        onStart={handleStartTask}
        onOpenBlockModal={(task) => {
          setSelectedTaskToBlock(task);
          setIsBlockingModalOpen(true);
        }}
      />

      {/* 5. Blockers & Active Support Signals (if any) */}
      {blockers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Active Blockers Under Review ({blockers.length})
            </h3>
          </div>
          <div className="space-y-2">
            {blockers.map((b) => (
              <div key={b.id} className="bg-white p-3 rounded-xl border border-amber-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">{b.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                    {b.blocked_category || 'Blocked'}
                  </span>
                </div>
                <p className="text-secondary text-[11px] mt-1">{b.blocked_reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocker Modal */}
      <BlockTaskModal
        task={selectedTaskToBlock}
        isOpen={isBlockingModalOpen}
        onClose={() => {
          setIsBlockingModalOpen(false);
          setSelectedTaskToBlock(null);
        }}
        onSubmit={handleBlockTaskSubmit}
        isSubmitting={isActionLoading}
      />
    </div>
  );
};
