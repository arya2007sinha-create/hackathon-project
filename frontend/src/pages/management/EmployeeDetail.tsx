import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managementApi } from '../../api/management.api';
import { ArrowLeft, Clock, CheckCircle2, AlertOctagon, TrendingUp, Sparkles } from 'lucide-react';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      managementApi.getEmployeeById(id).then(setData).finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading || !data) {
    return <div className="py-20 text-center text-xs text-secondary">Loading employee record...</div>;
  }

  const { employee, tasks, recentEvents, priorityAdherence } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <button
        onClick={() => navigate('/management/dashboard')}
        className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Operations Overview</span>
      </button>

      {/* Header Profile */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={employee.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={employee.name}
            className="w-14 h-14 rounded-2xl object-cover border border-border"
          />
          <div>
            <h1 className="text-xl font-bold text-primary">{employee.name}</h1>
            <p className="text-xs text-secondary">{employee.job_title} &bull; {employee.team?.name}</p>
            <p className="text-[11px] text-secondary font-mono mt-0.5">{employee.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary">Priority Adherence</p>
            <p className="text-xl font-bold text-accent">{priorityAdherence}%</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary">Attention Status</p>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-primary">
              {employee.attention_status || 'HEALTHY'}
            </span>
          </div>
        </div>
      </div>

      {/* Task Queue & Execution Order */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-sm font-bold text-primary mb-3">Assigned Work Queue (Prioritized Order)</h3>
        <div className="divide-y divide-border/60 text-xs">
          {tasks.map((t: any) => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-slate-100 font-bold flex items-center justify-center text-[10px] text-secondary">
                  #{t.current_rank || '-'}
                </span>
                <div>
                  <p className="font-semibold text-primary">{t.title}</p>
                  <p className="text-[11px] text-secondary line-clamp-1">{t.recommendation_reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="font-mono text-secondary">{t.estimated_minutes}m</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-secondary uppercase font-semibold text-[9px]">
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-sm font-bold text-primary mb-3">Recent Execution Events</h3>
        <div className="divide-y divide-border/60 text-xs">
          {recentEvents.map((ev: any) => (
            <div key={ev.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-semibold text-primary">{ev.event_type.replace('_', ' ')}</span>
              </div>
              <span className="text-[10px] text-secondary font-mono">
                {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
