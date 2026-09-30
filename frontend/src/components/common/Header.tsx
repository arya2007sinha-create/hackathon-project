import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { 
  Bell, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Briefcase,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenAiAssistant?: () => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAiAssistant, unreadAlertsCount = 0 }) => {
  const { user, logout, switchPersona } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const getStatusBadge = () => {
    if (!user) return null;
    const status = user.attention_status || 'HEALTHY';

    if (status === 'CRITICAL_ATTENTION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-criticalBg text-status-critical border border-status-criticalBorder">
          <span className="w-1.5 h-1.5 rounded-full bg-status-critical"></span>
          Critical Attention
        </span>
      );
    }
    if (status === 'NEEDS_ATTENTION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-attentionBg text-status-attention border border-status-attentionBorder">
          <span className="w-1.5 h-1.5 rounded-full bg-status-attention"></span>
          Needs Attention
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-healthyBg text-status-healthy border border-status-healthyBorder">
        <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
        Healthy
      </span>
    );
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Organization context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Organization</span>
          <span className="text-sm font-semibold text-primary">Northstar Technologies</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">Enterprise</span>
        </div>
        <div className="h-4 w-px bg-border"></div>
        {getStatusBadge()}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Persona Switcher for Hackathon Live Demo */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-primary-subtle border border-border rounded-lg transition-colors"
            title="Switch demo persona seamlessly"
          >
            <UserCheck className="w-3.5 h-3.5 text-accent" />
            <span>Switch Role: <strong className="capitalize">{user?.role}</strong></span>
            <ChevronDown className="w-3 h-3 text-secondary" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-modal p-1.5 z-50">
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Live Demo Personas
              </div>
              <button
                onClick={() => {
                  switchPersona('employee');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  user?.email === 'rahul.sharma@northstar.io' ? 'bg-accent/5 text-accent font-semibold' : 'text-primary'
                }`}
              >
                <div>
                  <p>Rahul Sharma (Employee)</p>
                  <p className="text-[10px] text-secondary">Operations / Integration Eng.</p>
                </div>
                {user?.email === 'rahul.sharma@northstar.io' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  switchPersona('manager');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  user?.email === 'sarah.chen@northstar.io' ? 'bg-accent/5 text-accent font-semibold' : 'text-primary'
                }`}
              >
                <div>
                  <p>Sarah Chen (Manager)</p>
                  <p className="text-[10px] text-secondary">VP of Operations & Eng.</p>
                </div>
                {user?.email === 'sarah.chen@northstar.io' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* AI Management Assistant Button */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent text-white hover:bg-accent-hover rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
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
