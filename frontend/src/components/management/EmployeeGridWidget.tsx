import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface EmployeeGridWidgetProps {
  employees: Array<{
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    teamName: string;
    progress: number;
    activeTasks: number;
    blockedTasks: number;
    priorityAdherence: number;
    attentionStatus: string;
  }>;
}

export const EmployeeGridWidget: React.FC<EmployeeGridWidgetProps> = ({ employees }) => {
  const navigate = useNavigate();

  const getAttentionBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-status-critical border border-red-200">
            🔴 Critical
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-status-attention border border-amber-200">
            🟠 Needs Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-status-healthy border border-emerald-200">
            🟢 Healthy
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-primary tracking-tight">Employee Operations Matrix</h3>
          <p className="text-xs text-secondary mt-0.5">
            Operational status, active workload, and priority adherence across all team members.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-secondary uppercase font-semibold text-[10px] tracking-wider">
              <th className="pb-3 pl-2">Employee</th>
              <th className="pb-3">Team</th>
              <th className="pb-3 text-center">Progress</th>
              <th className="pb-3 text-center">Active Tasks</th>
              <th className="pb-3 text-center">Blocked</th>
              <th className="pb-3 text-center">Priority Adherence</th>
              <th className="pb-3 text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => navigate(`/management/employees/${emp.id}`)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <td className="py-3 pl-2 font-medium text-primary">
                  <p className="font-semibold text-primary">{emp.name}</p>
                  <p className="text-[10px] text-secondary">{emp.jobTitle}</p>
                </td>
                <td className="py-3 text-secondary">{emp.teamName}</td>
                <td className="py-3 text-center">
                  <span className="font-semibold text-primary">{emp.progress}%</span>
                </td>
                <td className="py-3 text-center font-mono font-medium">{emp.activeTasks}</td>
                <td className="py-3 text-center">
                  {emp.blockedTasks > 0 ? (
                    <span className="font-bold text-status-attention">{emp.blockedTasks}</span>
                  ) : (
                    <span className="text-secondary">0</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`font-semibold ${
                      emp.priorityAdherence < 75
                        ? 'text-status-attention'
                        : 'text-status-healthy'
                    }`}
                  >
                    {emp.priorityAdherence}%
                  </span>
                </td>
                <td className="py-3 text-right pr-2">
                  {getAttentionBadge(emp.attentionStatus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
