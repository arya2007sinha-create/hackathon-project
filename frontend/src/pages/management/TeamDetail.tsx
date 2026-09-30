import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managementApi } from '../../api/management.api';
import { ArrowLeft, Users, CheckCircle2, AlertOctagon, GitBranch } from 'lucide-react';

export const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      managementApi.getTeamById(id).then(setData).finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading || !data) {
    return <div className="py-20 text-center text-xs text-secondary">Loading team details...</div>;
  }

  const { report, members, projects, tasks } = data;
  const team = report.team;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <button
        onClick={() => navigate('/management/dashboard')}
        className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Operations Overview</span>
      </button>

      {/* Team Header */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-primary">{team.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 text-secondary">
                {team.code}
              </span>
            </div>
            <p className="text-xs text-secondary mt-1 max-w-xl">{team.description}</p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                report.healthStatus === 'CRITICAL_ATTENTION'
                  ? 'bg-red-50 text-status-critical border border-red-200'
                  : report.healthStatus === 'NEEDS_ATTENTION'
                  ? 'bg-amber-50 text-status-attention border border-amber-200'
                  : 'bg-emerald-50 text-status-healthy border border-emerald-200'
              }`}
            >
              {report.healthStatus.replace('_', ' ')}
            </span>
            <p className="text-[11px] text-secondary mt-1">
              Expected: {report.expectedProgress}% &bull; Actual: {report.actualProgress}%
            </p>
          </div>
        </div>

        {/* Signals List */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">
            Operational Telemetry Signals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {report.signals.map((sig: string, idx: number) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-border/80 rounded-lg text-xs">
                {sig}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-sm font-bold text-primary mb-3">Team Roster ({members.length})</h3>
          <div className="divide-y divide-border/60">
            {members.map((m: any) => (
              <div
                key={m.id}
                onClick={() => navigate(`/management/employees/${m.id}`)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-primary">{m.name}</p>
                  <p className="text-[11px] text-secondary">{m.job_title}</p>
                </div>
                <span className="text-[10px] font-medium text-accent">View History &rarr;</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-sm font-bold text-primary mb-3">Active Projects ({projects.length})</h3>
          <div className="space-y-3">
            {projects.map((p: any) => (
              <div key={p.id} className="p-3 border border-border rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-primary">{p.name}</h4>
                  <span className="text-[10px] font-bold text-accent uppercase">{p.priority}</span>
                </div>
                <p className="text-[11px] text-secondary">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
