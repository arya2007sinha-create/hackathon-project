import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employee.api';
import { Task } from '../../types';
import { BlockTaskModal } from '../../components/employee/BlockTaskModal';
import { Play, Pause, CheckCircle2, AlertOctagon, RefreshCw, Clock } from 'lucide-react';

export const EmployeeTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskToBlock, setSelectedTaskToBlock] = useState<Task | null>(null);
  const [isBlockingModalOpen, setIsBlockingModalOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await employeeApi.getTasks();
      setTasks(data);
    } catch {
      console.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStartTask = async (taskId: string) => {
    await employeeApi.updateStatus(taskId, 'IN_PROGRESS');
    await fetchTasks();
  };

  const handleCompleteTask = async (taskId: string) => {
    await employeeApi.updateStatus(taskId, 'COMPLETED');
    await fetchTasks();
  };

  const handleBlockTaskSubmit = async (formData: {
    blockedCategory: string;
    blockedReason: string;
    requestSupport: boolean;
  }) => {
    if (!selectedTaskToBlock) return;
    await employeeApi.blockTask(
      selectedTaskToBlock.id,
      formData.blockedCategory,
      formData.blockedReason,
      formData.requestSupport
    );
    setIsBlockingModalOpen(false);
    await fetchTasks();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">All Assigned Work Items</h1>
          <p className="text-xs text-secondary mt-1">
            Complete inventory of active sprint deliverables ordered by the autonomous priority engine.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="p-2 border border-border bg-card hover:bg-slate-50 text-secondary hover:text-primary rounded-xl"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="divide-y divide-border/60">
          {tasks.map((task, idx) => (
            <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-md bg-slate-100 text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                  #{task.current_rank || idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-secondary">{task.task_code || 'TSK'}</span>
                    <h4 className="text-xs font-semibold text-primary">{task.title}</h4>
                    {task.is_carried_forward && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase font-semibold">
                        Carried Over
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-secondary mt-0.5 max-w-xl">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0 ml-9 sm:ml-0">
                <span className="font-mono text-[11px] text-secondary">{task.estimated_minutes}m</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-100 text-secondary">
                  {task.status}
                </span>

                {task.status !== 'COMPLETED' && (
                  <div className="flex items-center gap-1.5">
                    {task.status !== 'IN_PROGRESS' ? (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="p-1.5 hover:bg-slate-200 text-primary rounded-lg"
                        title="Start task"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="p-1.5 hover:bg-emerald-100 text-status-healthy rounded-lg"
                        title="Complete task"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTaskToBlock(task);
                        setIsBlockingModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-amber-100 text-status-attention rounded-lg"
                      title="Mark blocked"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BlockTaskModal
        task={selectedTaskToBlock}
        isOpen={isBlockingModalOpen}
        onClose={() => {
          setIsBlockingModalOpen(false);
          setSelectedTaskToBlock(null);
        }}
        onSubmit={handleBlockTaskSubmit}
      />
    </div>
  );
};
