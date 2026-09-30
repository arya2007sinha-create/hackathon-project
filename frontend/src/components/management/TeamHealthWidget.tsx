import React from 'react';
import { Team } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';

interface TeamHealthWidgetProps {
  teams: Team[];
}

export const TeamHealthWidget: React.FC<TeamHealthWidgetProps> = ({ teams }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-status-criticalBg text-status-critical border border-status-criticalBorder">
            <span className="w-1.5 h-1.5 rounded-full bg-status-critical"></span>
            RED — Critical Attention
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-status-attentionBg text-status-attention border border-status-attentionBorder">
            <span className="w-1.5 h-1.5 rounded-full bg-status-attention"></span>
            ORANGE — Needs Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-status-healthyBg text-status-healthy border border-status-healthyBorder">
            <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
            GREEN — Healthy
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-primary tracking-tight">Team Health</h3>
          <p className="text-xs text-secondary mt-0.5">
            Real-time operational velocity, progress deltas, and risk classifications across 5 teams.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {teams.map((t) => {
          const isOps = t.code === 'OPS';
          return (
            <div
              key={t.id}
              onClick={() => navigate(`/management/teams/${t.id}`)}
              className={`py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl cursor-pointer transition-all ${
                isOps
                  ? 'bg-amber-50/40 border border-amber-200/60 my-1'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-primary">{t.name}</h4>
                  <span className="text-[10px] font-mono text-secondary">({t.code})</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-secondary mt-1">
                  <span>Expected: <strong>{t.expected_progress}%</strong></span>
                  <span>Actual: <strong>{t.actual_progress}%</strong></span>
                  {t.expected_progress - t.actual_progress > 0 && (
                    <span className="text-amber-700 font-medium">
                      Delta: -{(t.expected_progress - t.actual_progress).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(t.health_status)}
                <ChevronRight className="w-4 h-4 text-secondary" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
