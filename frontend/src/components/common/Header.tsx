import React, { useState } from 'react';
import { useAuth, DEMO_MANAGERS, DEMO_EMPLOYEES } from '../../store/AuthContext';
import { 
  Bell, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Briefcase,
  ChevronDown,
  Menu
} from 'lucide-react';

interface HeaderProps {
  onOpenAiAssistant?: () => void;
  onToggleMobileMenu?: () => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAiAssistant, 
  onToggleMobileMenu, 
  unreadAlertsCount = 0 
}) => {
  const { user, logout, switchPersona, loginWithAccount } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const getStatusBadge = () => {
    if (!user) return null;
    const status = user.attention_status || 'HEALTHY';

    if (status === 'CRITICAL_ATTENTION') {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-criticalBg text-status-critical border border-status-criticalBorder">
          <span className="w-1.5 h-1.5 rounded-full bg-status-critical"></span>
          Critical
        </span>
      );
    }
    if (status === 'NEEDS_ATTENTION') {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-attentionBg text-status-attention border border-status-attentionBorder">
          <span className="w-1.5 h-1.5 rounded-full bg-status-attention"></span>
          Attention
        </span>
      );
    }
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-healthyBg text-status-healthy border border-status-healthyBorder">
        <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
        Healthy
      </span>
    );
  };

  return (
    <header className="h-16 bg-card border-b border-border px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Organization context */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-secondary hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 rounded bg-primary flex md:hidden items-center justify-center text-white font-bold text-xs">
            P
          </div>
          <span className="text-xs sm:text-sm font-semibold text-primary truncate max-w-[120px] sm:max-w-none">
            Northstar Tech
          </span>
          <span className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
            Enterprise
          </span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-border"></div>
        {getStatusBadge()}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Quick Persona Switcher for Hackathon Live Demo */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-primary-subtle border border-border rounded-lg transition-colors"
            title="Switch demo persona seamlessly"
          >
            <UserCheck className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-[11px] sm:text-xs">
              <span className="hidden sm:inline">Role: </span>
              <strong className="capitalize">{user?.role}</strong>
            </span>
            <ChevronDown className="w-3 h-3 text-secondary shrink-0" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-card border border-border rounded-xl shadow-modal p-2 z-50 max-h-[75vh] overflow-y-auto page-enter-animation">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent border-b border-border mb-1.5 flex items-center justify-between">
                <span>👔 Managers & Leadership</span>
                <span className="text-[9px] text-secondary font-normal">Click to switch</span>
              </div>
              
              {DEMO_MANAGERS.map((mgr) => (
                <button
                  key={mgr.email}
                  onClick={async () => {
                    await loginWithAccount(mgr);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    user?.email === mgr.email ? 'bg-accent/10 text-accent font-bold' : 'text-primary'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate text-xs font-semibold">{mgr.name}</p>
                    <p className="text-[10px] text-secondary truncate">{mgr.jobTitle}</p>
                  </div>
                  {user?.email === mgr.email && <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />}
                </button>
              ))}

              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary border-b border-t border-border my-1.5 flex items-center justify-between">
                <span>👷 Frontline Employees</span>
                <span className="text-[9px] text-secondary font-normal">Individual Contributors</span>
              </div>

              {DEMO_EMPLOYEES.map((emp) => (
                <button
                  key={emp.email}
                  onClick={async () => {
                    await loginWithAccount(emp);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    user?.email === emp.email ? 'bg-accent/10 text-accent font-bold' : 'text-primary'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate text-xs font-semibold">{emp.name}</p>
                    <p className="text-[10px] text-secondary truncate">{emp.team} &bull; {emp.jobTitle}</p>
                  </div>
                  {user?.email === emp.email && <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Management Assistant Button */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-accent text-white hover:bg-accent-hover rounded-lg shadow-sm transition-all"
            title="Open AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        )}

        {/* Notifications Icon */}
        <div className="relative">
          <button className="p-2 text-secondary hover:text-primary hover:bg-slate-50 rounded-lg transition-colors relative">
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-attention ring-2 ring-card" />
            )}
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="h-6 w-px bg-border"></div>
        <div className="flex items-center gap-2.5">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-primary leading-tight">{user?.name}</p>
            <p className="text-[11px] text-secondary leading-tight capitalize">{user?.job_title}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-secondary hover:text-status-critical hover:bg-red-50 rounded-md transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
