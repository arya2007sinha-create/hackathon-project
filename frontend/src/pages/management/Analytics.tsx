import React, { useState, useEffect } from 'react';
import { managementApi } from '../../api/management.api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7D');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    managementApi.getAnalytics(timeRange).then(setData).finally(() => setIsLoading(false));
  }, [timeRange]);

  if (isLoading || !data) {
    return <div className="py-20 text-center text-xs text-secondary">Aggregating analytics data...</div>;
  }

  const { completionVelocity, adherenceTrend, workloadDistribution, summary } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Executive Analytics</h1>
          <p className="text-xs text-secondary mt-1">
            Completion velocity, priority adherence trajectories, and cross-team workload capacity.
          </p>
        </div>

        {/* Time Filter Chips */}
        <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl text-xs">
          {['Today', '7D', '30D', '90D'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-subtle flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Overall Adherence</p>
            <p className="text-xl font-bold text-primary mt-0.5">{summary.overallAdherenceRate}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-subtle flex items-center gap-4">
          <div className="p-3 rounded-xl bg-status-healthyBg text-status-healthy">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Avg Resolution Time</p>
            <p className="text-xl font-bold text-primary mt-0.5">{summary.averageResolutionHours}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-subtle flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Active Bottlenecks</p>
            <p className="text-xl font-bold text-primary mt-0.5">{summary.activeBottlenecks} tasks</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Velocity (Planned vs Completed) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-sm font-bold text-primary mb-1">Completion Velocity</h3>
          <p className="text-[11px] text-secondary mb-4">Planned workload commitments vs actual completions.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionVelocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="planned" fill="#E2E8F0" name="Planned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#4338CA" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Adherence Trend */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-sm font-bold text-primary mb-1">Priority Adherence Trajectory</h3>
          <p className="text-[11px] text-secondary mb-4">% of tasks executed according to autonomous recommendations.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adherenceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[70, 100]} stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  name="Adherence %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Workload Distribution Across Teams */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-sm font-bold text-primary mb-1">Workload Distribution vs Team Capacity</h3>
        <p className="text-[11px] text-secondary mb-4">Identification of team overallocation bottlenecks.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="team" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="capacity" fill="#E2E8F0" name="Team Capacity" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" fill="#F59E0B" name="Active Tasks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
