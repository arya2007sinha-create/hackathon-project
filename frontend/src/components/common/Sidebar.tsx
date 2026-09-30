import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Users,
  ShieldAlert,
  BarChart3,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between h-screen sticky top-0 select-none z-20">
      <div>
        {/* Brand Logo & Name */}
        <div className="h-16 flex items-center px-6 border-b border-border gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">
            <span className="text-accent-light">P</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-primary">PRIORA</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                AI
              </span>
            </div>
            <p className="text-[10px] text-secondary">Intelligent Orchestration</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-6">
          {/* Employee Workspace */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-secondary mb-2">
              My Execution
            </p>
            <div className="space-y-1">
              <NavLink
                to="/employee/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white font-semibold shadow-sm'
                      : 'text-primary-subtle hover:bg-slate-50 hover:text-primary'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Next Best Action</span>
              </NavLink>

              <NavLink
                to="/employee/tasks"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white font-semibold shadow-sm'
                      : 'text-primary-subtle hover:bg-slate-50 hover:text-primary'
                  }`
                }
              >
                <CheckSquare className="w-4 h-4" />
                <span>Today's Execution Plan</span>
              </NavLink>
            </div>
          </div>

          {/* Management Workspace (Always visible for managers/admins) */}
          {isManagerOrAdmin && (
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-secondary mb-2">
                Operations & Oversight
              </p>
              <div className="space-y-1">
                <NavLink
                  to="/management/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white font-semibold shadow-sm'
                        : 'text-primary-subtle hover:bg-slate-50 hover:text-primary'
                    }`
                  }
                >
                  <Layers className="w-4 h-4" />
                  <span>Operations Overview</span>
                </NavLink>

                <NavLink
                  to="/management/teams"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white font-semibold shadow-sm'
                        : 'text-primary-subtle hover:bg-slate-50 hover:text-primary'
                    }`
                  }
                >
                  <Users className="w-4 h-4" />
                  <span>Team Health (5 Teams)</span>
                </NavLink>

                <NavLink
                  to="/management/tasks"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white font-semibold shadow-sm'
                        : 'text-primary-subtle hover:bg-slate-50 hover:text-primary'
                    }`
                  }
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Tasks & Overrides</span>
                </NavLink>

                <NavLink
                  to="/management/analytics"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white font-semibold shadow-sm'
                        : 'text-primary-subtle hover:bg-slate-50 hover:text-primary'
                    }`
                  }
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Executive Analytics</span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Info & Core loop reminder */}
      <div className="p-4 border-t border-border bg-slate-50/50">
        <div className="p-2.5 bg-white border border-border rounded-lg">
          <div className="flex items-center gap-1.5 text-accent text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Loop</span>
          </div>
          <p className="text-[10px] text-secondary leading-snug">
            Plan → Prioritize → Execute → Detect → Support → Reprioritize
          </p>
        </div>
      </div>
    </aside>
  );
};
