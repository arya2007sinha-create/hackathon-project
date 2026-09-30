import React, { useState } from 'react';
import { X, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Task } from '../../types';

interface ManagerOverrideModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, newRank: number, reason: string) => Promise<void>;
}

export const ManagerOverrideModal: React.FC<ManagerOverrideModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newRank, setNewRank] = useState<number>(1);
  const [reason, setReason] = useState<string>('Strategic executive directive: customer escalation must be cleared before Q3 close.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(task.id, Number(newRank), reason);
      onClose();
    } catch {
      alert('Failed to apply override');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-modal overflow-hidden p-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-primary">Manager Priority Override</h3>
          </div>
          <button onClick={onClose} className="p-1 text-secondary hover:text-primary rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <span className="text-secondary font-medium uppercase text-[10px]">Target Task</span>
            <p className="font-semibold text-primary mt-0.5">{task.title}</p>
            <p className="text-[11px] text-secondary">
              Current Rank: #{task.rank || task.current_rank || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-primary mb-1">
              New Designated Priority Rank
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={newRank}
              onChange={(e) => setNewRank(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none"
              required
            />
            <p className="text-[10px] text-secondary mt-1">
              Rank #1 will designate this task as the employee's <strong>Next Best Action</strong>.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-primary mb-1">
              Override Reason (Audit Log Required)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the operational justification for overriding autonomous ordering..."
              className="w-full p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-accent outline-none resize-none"
              required
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
            <strong>Audit Policy:</strong> Manual overrides are tagged with a permanent badge and logged in the immutable execution history.
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
              {isSubmitting ? 'Applying...' : 'Apply Priority Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
