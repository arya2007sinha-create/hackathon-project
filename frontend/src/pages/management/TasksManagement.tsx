import React, { useState, useEffect } from 'react';
import { managementApi } from '../../api/management.api';
import { Task, Team, User } from '../../types';
import { ManagerOverrideModal } from '../../components/management/ManagerOverrideModal';
import { CreateTaskModal } from '../../components/management/CreateTaskModal';
import { Search, Plus, ArrowUpRight, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';

export const TasksManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTaskForOverride, setSelectedTaskForOverride] = useState<Task | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await managementApi.getTasks({
        search: search || undefined,
        teamId: teamFilter || undefined,
        status: statusFilter || undefined,
      });
      setTasks(data);
    } catch {
      console.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([managementApi.getTeams(), managementApi.getEmployees()]).then(([t, e]) => {
      setTeams(t);
      setEmployees(e);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, teamFilter, statusFilter]);

  const handleApplyOverride = async (taskId: string, newRank: number, reason: string) => {
    await managementApi.createOverride(taskId, newRank, reason);
    await fetchTasks();
  };

  const handleCreateTask = async (taskData: any) => {
    await managementApi.createTask(taskData);
    await fetchTasks();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Work Items & Priority Overrides
          </h1>
          <p className="text-xs text-secondary mt-1">
            Browse all organizational tasks, inspect autonomous priority scores, or apply managerial priority overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
          <button
            onClick={fetchTasks}
            className="p-2 border border-border bg-card hover:bg-slate-50 text-secondary hover:text-primary rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tasks by title, code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="text-xs p-2 border border-border rounded-lg bg-card text-primary outline-none"
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 border border-border rounded-lg bg-card text-primary outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-secondary uppercase font-semibold text-[10px] tracking-wider bg-slate-50/50">
                <th className="py-3 pl-4">Rank</th>
                <th className="py-3">Task Details</th>
                <th className="py-3">Team</th>
                <th className="py-3">Assignee</th>
                <th className="py-3">Priority</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-4 font-mono font-bold text-accent">
                    #{task.current_rank || '-'}
                  </td>
                  <td className="py-3.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-secondary">
                        {task.task_code || 'TSK'}
                      </span>
                      <p className="font-semibold text-primary">{task.title}</p>
                    </div>
                    {task.recommendation_reason && (
                      <p className="text-[11px] text-secondary line-clamp-1 mt-0.5">
                        {task.recommendation_reason}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 text-secondary">{task.team?.name || 'Operations'}</td>
                  <td className="py-3.5 font-medium text-primary">
                    {task.assigned_user?.name || <span className="text-secondary">Unassigned</span>}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`text-[10px] font-bold ${
                        task.priority === 'CRITICAL'
                          ? 'text-status-critical'
                          : task.priority === 'HIGH'
                          ? 'text-amber-600'
                          : 'text-secondary'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-100 text-secondary border border-border">
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-4">
                    <button
                      onClick={() => {
                        setSelectedTaskForOverride(task);
                        setIsOverrideModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Override Rank</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      <ManagerOverrideModal
        task={selectedTaskForOverride}
        isOpen={isOverrideModalOpen}
        onClose={() => {
          setIsOverrideModalOpen(false);
          setSelectedTaskForOverride(null);
        }}
        onSubmit={handleApplyOverride}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        teams={teams}
        employees={employees}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};
