import React, { useState, useEffect } from 'react';
import { managementApi } from '../../api/management.api';
import { ManagementDashboardData, Team, User } from '../../types';
import { TeamHealthWidget } from '../../components/management/TeamHealthWidget';
import { PriorityAdherenceWidget } from '../../components/management/PriorityAdherenceWidget';
import { EarlyWarningWidget } from '../../components/management/EarlyWarningWidget';
import { EmployeeGridWidget } from '../../components/management/EmployeeGridWidget';
import { CreateTaskModal } from '../../components/management/CreateTaskModal';
import {
  Users,
  Layers,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Bell,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const ManagementDashboard: React.FC = () => {
  const [data, setData] = useState<ManagementDashboardData | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);

  const fetchDashboard = async () => {
    try {
      const res = await managementApi.getDashboard();
      setData(res);
      const [tRes, eRes] = await Promise.all([
        managementApi.getTeams(),
        managementApi.getEmployees(),
      ]);
      setTeams(tRes);
      setEmployees(eRes);
    } catch {
      console.error('Failed to load management dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateTask = async (taskData: any) => {
    await managementApi.createTask(taskData);
    await fetchDashboard();
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-secondary">Aggregating enterprise telemetry & team health indicators...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-primary">Unable to load management overview.</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, teamHealth, attentionCenter, earlyWarning, priorityAdherenceSpotlight, employeeGrid, recentEvents } = data;

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Team Operations Overview
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold uppercase">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            "WHERE DOES ATTENTION NEED TO GO?" &bull; Autonomous bottleneck detection and execution adherence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Prioritize Task</span>
          </button>

          <button
            onClick={fetchDashboard}
            className="p-2 border border-border bg-card hover:bg-slate-50 text-secondary hover:text-primary rounded-xl transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Executive Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Employees</p>
          <p className="text-xl font-bold text-primary mt-1">{metrics.totalEmployees}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Active Tasks</p>
          <p className="text-xl font-bold text-primary mt-1">{metrics.activeTasks}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Completed Today</p>
          <p className="text-xl font-bold text-status-healthy mt-1">{metrics.completedToday}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Blocked Tasks</p>
          <p className={`text-xl font-bold mt-1 ${metrics.blocked > 0 ? 'text-status-attention' : 'text-primary'}`}>
            {metrics.blocked}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Overdue Tasks</p>
          <p className={`text-xl font-bold mt-1 ${metrics.overdue > 0 ? 'text-status-critical' : 'text-primary'}`}>
            {metrics.overdue}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Attention Signals</p>
          <p className="text-xl font-bold text-accent mt-1">{metrics.attentionSignals}</p>
        </div>
      </div>

      {/* 3. Team Health (5 Teams) */}
      <TeamHealthWidget teams={teamHealth} />

      {/* 4. Attention Center */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold text-primary tracking-tight">Attention Center</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-secondary">
            {attentionCenter.length} Active Operational Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {attentionCenter.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition-colors ${
                alert.severity === 'RED'
                  ? 'bg-red-50/50 border-red-200'
                  : alert.severity === 'ORANGE'
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50 border-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      alert.severity === 'RED'
                        ? 'bg-red-100 text-status-critical'
                        : alert.severity === 'ORANGE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-status-info'
                    }`}
                  >
                    {alert.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-secondary">Today</span>
                </div>
                <h4 className="font-semibold text-primary text-xs">{alert.title}</h4>
                <p className="text-secondary text-[11px] mt-1 leading-snug">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Flagship Widgets: Priority Adherence & Early Warning System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityAdherenceWidget spotlight={priorityAdherenceSpotlight} />
        <EarlyWarningWidget data={earlyWarning} />
      </div>

      {/* 6. Employee Operations Matrix Grid */}
      <EmployeeGridWidget employees={employeeGrid} />

      {/* 7. Recent Operational Events Feed */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-base font-bold text-primary tracking-tight mb-3">
          Recent Execution Events (Audit Trail)
        </h3>
        <div className="divide-y divide-border/60">
          {recentEvents.map((ev) => (
            <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-semibold text-primary">{ev.userName}</span>
                <span className="text-secondary">&bull;</span>
                <span className="text-secondary">{ev.type.replace('_', ' ')}:</span>
                <span className="font-medium text-primary">{ev.taskTitle}</span>
              </div>
              <span className="text-[10px] text-secondary font-mono">
                {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        teams={teams}
        employees={employees}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};
