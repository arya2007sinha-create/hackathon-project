import React, { useState } from 'react';
import { Task } from '../../types';
import { X, AlertOctagon, ArrowRight } from 'lucide-react';

interface BlockTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { blockedCategory: string; blockedReason: string; requestSupport: boolean }) => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  'Waiting for another person',
  'Waiting for information',
  'Technical issue',
  'Requirement unclear',
  'External dependency',
  'Too complex',
  'Other',
];

export const BlockTaskModal: React.FC<BlockTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('External dependency');
  const [reason, setReason] = useState<string>('Vendor sandbox API key is throwing rate-limit errors and token documentation is incomplete.');
  const [requestSupport, setRequestSupport] = useState<boolean>(true);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit({
      blockedCategory: selectedCategory,
      blockedReason: reason,
      requestSupport,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-modal overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-status-attention">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-base font-bold text-primary">What's blocking this task?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-primary rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-secondary mb-1">Task</p>
            <p className="text-xs font-semibold text-primary">{task.title}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-2">
              Primary Bottleneck Reason
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? 'border-accent bg-accent/5 font-semibold text-accent'
                      : 'border-border text-primary hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="accent-accent text-accent"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">
              Explanation & Context
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe what you need to unblock this task..."
              className="w-full text-xs p-3 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
            <input
              type="checkbox"
              id="reqSupport"
              checked={requestSupport}
              onChange={(e) => setRequestSupport(e.target.checked)}
              className="rounded accent-amber-600"
            />
            <label htmlFor="reqSupport" className="cursor-pointer">
              Send immediate alert to Sarah Chen (Manager) and flag status as <strong>🟠 Needs Attention</strong>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-secondary hover:text-primary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-status-attention hover:bg-amber-600 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Request Support'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
