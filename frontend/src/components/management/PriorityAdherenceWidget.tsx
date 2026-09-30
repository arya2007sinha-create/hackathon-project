import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, Info, Clock, CheckCircle2, X } from 'lucide-react';

interface PriorityAdherenceWidgetProps {
  spotlight: {
    title: string;
    employee: string;
    team: string;
    recommended: string;
    actual: string;
    elapsedMinutes: number;
    status: string;
    contextualNotes: string;
  };
}

export const PriorityAdherenceWidget: React.FC<PriorityAdherenceWidgetProps> = ({ spotlight }) => {
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-attention"></span>
          <h3 className="text-base font-bold text-primary tracking-tight">
            Priority Adherence Intelligence
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-attentionBg text-status-attention border border-status-attentionBorder">
          🟠 Priority Deviation
        </span>
      </div>

      <div className="bg-slate-50/70 border border-border rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              Flagged Employee
            </span>
            <p className="text-xs font-bold text-primary">
              {spotlight.employee} <span className="font-normal text-secondary">({spotlight.team})</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Active for {spotlight.elapsedMinutes} minutes</span>
          </div>
        </div>

        {/* Recommended vs Actual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2 border-t border-border/80">
          <div className="bg-white p-3 rounded-lg border border-border/60">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider mb-1">
              System Recommended Order
            </p>
            <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-accent text-white flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span>{spotlight.recommended}</span>
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-amber-200">
            <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider mb-1">
              Actual Execution Started
            </p>
            <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <span>{spotlight.actual}</span>
            </p>
          </div>
        </div>

        <p className="text-[11px] text-secondary mt-3">
          <strong>Context:</strong> {spotlight.contextualNotes}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-secondary">
          <Info className="w-3.5 h-3.5" />
          <span>Deviations are operational signals, not punitive measures.</span>
        </div>

        <button
          onClick={() => setShowDetailModal(true)}
          className="px-3.5 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-subtle text-white rounded-lg transition-colors flex items-center gap-1.5"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Investigation Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="text-sm font-bold text-primary">Priority Deviation Investigation</h4>
              <button onClick={() => setShowDetailModal(false)}>
                <X className="w-4 h-4 text-secondary hover:text-primary" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                <p className="font-semibold mb-1">Execution Order Divergence</p>
                <p>
                  System recommended <strong>Task #2 (Data Pipeline Validation)</strong> before{' '}
                  <strong>Task #3 (Feature Store Optimization)</strong> due to schema upstream dependencies.
                </p>
              </div>

              <div>
                <p className="font-semibold text-secondary uppercase text-[10px] tracking-wider mb-1">
                  Possible Operational Factors
                </p>
                <ul className="list-disc pl-4 space-y-1 text-secondary text-[11px]">
                  <li>Employee encountered unannounced dependency block on Task #2</li>
                  <li>Local test environment was already spun up for Task #3</li>
                  <li>Temporary cache invalidation was required first</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-1.5 text-xs font-medium text-secondary hover:text-primary rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Check-in notification sent to employee.');
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover"
                >
                  Acknowledge & Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
