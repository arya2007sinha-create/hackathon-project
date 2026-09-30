import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EarlyWarningWidgetProps {
  data: {
    teamName: string;
    status: string;
    expectedProgress: number;
    currentProgress: number;
    delta: number;
    contributingSignals: string[];
    suggestedInvestigationArea: string;
    investigationTaskId?: string;
  };
}

export const EarlyWarningWidget: React.FC<EarlyWarningWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-base font-bold text-primary tracking-tight">
            Early Warning System
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          🟠 Team Slowdown
        </span>
      </div>

      <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-amber-900">
            {data.teamName} Team is progressing slower than expected
          </p>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-mono font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-{(data.delta).toFixed(1)}% delta</span>
          </div>
        </div>

        {/* Comparison Metrics */}
        <div className="flex items-center gap-6 py-2 border-y border-amber-200/60 my-2 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-amber-800">Expected Progress</p>
            <p className="text-lg font-bold text-primary">{data.expectedProgress}%</p>
          </div>
          <div className="h-8 w-px bg-amber-200/80"></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-amber-800">Current Velocity</p>
            <p className="text-lg font-bold text-amber-700">{data.currentProgress}%</p>
          </div>
        </div>

        {/* Contributing Signals */}
        <div className="mt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1.5">
            Potential Contributing Signals:
          </p>
          <ul className="space-y-1">
            {data.contributingSignals.map((signal, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-amber-900">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Area & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            Suggested Investigation Area:
          </span>
          <p className="text-xs font-semibold text-primary">
            {data.suggestedInvestigationArea}
          </p>
        </div>

        <button
          onClick={() => navigate('/management/tasks')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-subtle text-white text-xs font-semibold rounded-xl transition-all"
        >
          <span>Investigate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
