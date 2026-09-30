import React, { useState } from 'react';
import { X, Plus, Clock, AlertCircle } from 'lucide-react';
import { Team, User, TaskPriority, BusinessImpact } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  employees: User[];
  onCreateTask: (taskData: any) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  teams,
  employees,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [businessImpact, setBusinessImpact] = useState<BusinessImpact>('HIGH');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(90);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !teamId) return;

    setIsSubmitting(true);
    try {
      await onCreateTask({
        title,
        description,
        teamId,
        assignedTo: assignedTo || undefined,
        priority,
        businessImpact,
        deadline: new Date(deadline).toISOString(),
        estimatedMinutes: Number(estimatedMinutes),
      });
      onClose();
    } catch {
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-modal overflow-hidden p-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-primary">Assign New Work Item</h3>
          </div>
          <button onClick={onClose} className="p-1 text-secondary hover:text-primary rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-primary mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Token Revocation Endpoint"
              className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-primary mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational details and acceptance criteria..."
              className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-primary mb-1">Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
                required
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
              >
                <option value="">Auto-assign / Unassigned</option>
                {employees.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.job_title})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-primary mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">Business Impact</label>
              <select
                value={businessImpact}
                onChange={(e) => setBusinessImpact(e.target.value as BusinessImpact)}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-primary mb-1">Deadline Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">Estimate (Minutes)</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
                min={15}
                step={15}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-border rounded-lg text-secondary text-[11px] flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent shrink-0" />
            <span>Adding this task will immediately trigger autonomous priority recalculation for the assignee.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-secondary hover:text-primary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create & Prioritize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
