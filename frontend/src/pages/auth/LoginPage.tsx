import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_MANAGERS, DEMO_EMPLOYEES, DemoAccount } from '../../store/AuthContext';
import { ArrowRight, Lock, Mail, ShieldAlert, Users, Briefcase, KeyRound, Sparkles, Building2, Play } from 'lucide-react';
import { GuidedDemoTour } from '../../components/common/GuidedDemoTour';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithAccount } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'employees' | 'managers' | 'custom'>('managers');
  const [email, setEmail] = useState('sarah.chen@northstar.io');
  const [password, setPassword] = useState('Manager123!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState<string>('sarah.chen@northstar.io');
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);

  const handleQuickLogin = async (account: DemoAccount) => {
    setError(null);
    setIsLoading(true);
    setSelectedAccountEmail(account.email);

    try {
      await loginWithAccount(account);
      if (account.role === 'manager' || account.role === 'admin') {
        navigate('/management/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to authenticate demo account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // Route based on email pattern or response
      if (email.includes('sarah') || email.includes('admin') || email.includes('david')) {
        navigate('/management/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 page-enter-animation">
      {/* Top Ambient Light Strip */}
      <div className="fixed top-0 left-0 right-0 ambient-top-accent" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Northstar Technologies &bull; Enterprise Work Orchestration</span>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-sm">
            <span className="text-accent-light">P</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">PRIORA</h1>
        </div>

        <p className="text-xs uppercase font-semibold tracking-wider text-accent">
          Intelligent Priority Orchestration & Operational Visibility
        </p>
        <p className="text-xs text-secondary mt-2 max-w-lg mx-auto leading-relaxed">
          "Employees shouldn't spend mental energy deciding what to work on next, while managers shouldn't discover execution problems after they become critical."
        </p>

        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsDemoTourOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>🎬 Launch 3-Minute Video Demo Guide</span>
          </button>
        </div>
      </div>

      {/* Main Login / Demo Selection Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-card border border-border shadow-card rounded-2xl p-4 sm:p-8 card-stagger-1">
          
          {/* Navigation Pill Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border pb-4 mb-6 gap-2.5">
            <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('managers');
                  setEmail('sarah.chen@northstar.io');
                  setPassword('Manager123!');
                }}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'managers'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-secondary hover:text-primary hover:bg-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Managers & Leadership</span>
                  <span className="sm:hidden">Managers</span> ({DEMO_MANAGERS.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('employees');
                  setEmail('rahul.sharma@northstar.io');
                  setPassword('Employee123!');
                }}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'employees'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-secondary hover:text-primary hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Frontline Employees</span>
                  <span className="sm:hidden">Employees</span> ({DEMO_EMPLOYEES.length})
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'custom'
                  ? 'text-accent bg-accent/10 border border-accent/30'
                  : 'text-secondary hover:text-primary hover:bg-slate-100'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Manual Login</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-status-critical text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Managers & Leadership Logins */}
          {activeTab === 'managers' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Select a Management Persona to Launch Portal
                </span>
                <span className="text-[11px] text-accent font-medium">1-Click Instant Login</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DEMO_MANAGERS.map((mgr) => {
                  const isCurrent = selectedAccountEmail === mgr.email;
                  return (
                    <div
                      key={mgr.email}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'border-accent bg-indigo-50/40 ring-1 ring-accent shadow-sm'
                          : 'border-border bg-white hover:border-accent/60 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={mgr.avatarUrl}
                            alt={mgr.name}
                            className="w-8 h-8 rounded-full object-cover border border-border"
                          />
                          <div>
                            <p className="text-xs font-bold text-primary leading-tight">{mgr.name}</p>
                            <span className="inline-block text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                              {mgr.role}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] font-medium text-primary mt-1">{mgr.jobTitle}</p>
                        <p className="text-[10px] text-secondary mt-1 leading-snug line-clamp-2">
                          {mgr.highlight}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickLogin(mgr)}
                          className="w-full py-1.5 px-2 bg-primary hover:bg-primary-subtle text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                        >
                          <span>{isLoading && isCurrent ? 'Signing in...' : 'Launch Portal'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Frontline Employees Logins */}
          {activeTab === 'employees' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Select an Individual Contributor Persona
                </span>
                <span className="text-[11px] text-accent font-medium">1-Click Instant Login</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEMO_EMPLOYEES.map((emp) => {
                  const isCurrent = selectedAccountEmail === emp.email;
                  return (
                    <div
                      key={emp.email}
                      className={`relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'border-accent bg-indigo-50/40 ring-1 ring-accent shadow-sm'
                          : 'border-border bg-white hover:border-accent/60 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-7 h-7 rounded-full object-cover border border-border"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-primary truncate leading-tight">{emp.name}</p>
                            <span className="inline-block text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-secondary">
                              {emp.team}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] font-semibold text-primary truncate">{emp.jobTitle}</p>
                        <p className="text-[10px] text-secondary mt-1 leading-snug line-clamp-2">
                          {emp.highlight}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border/60">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickLogin(emp)}
                          className="w-full py-1.5 px-2 bg-primary hover:bg-primary-subtle text-white text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                        >
                          <span>{isLoading && isCurrent ? 'Signing in...' : 'Launch Portal'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Custom Credentials Form */}
          {activeTab === 'custom' && (
            <div className="max-w-md mx-auto py-2">
              <p className="text-xs text-secondary mb-4 text-center">
                Sign in with any enterprise email address and password registered in the Northstar database.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Corporate Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-secondary absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@northstar.io"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-xl focus:ring-1 focus:ring-accent outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-secondary absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-xl focus:ring-1 focus:ring-accent outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-subtle text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Credential Reference Bar */}
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-secondary gap-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-secondary" />
              <span>Northstar Technologies Database</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Password for all managers: <strong className="text-primary font-mono">Manager123!</strong></span>
              <span>&bull;</span>
              <span>Password for all employees: <strong className="text-primary font-mono">Employee123!</strong></span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-secondary mt-4">
          PRIORA Enterprise Work Orchestration Platform &bull; Hackathon Production Release
        </p>
      </div>

      <GuidedDemoTour
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
      />
    </div>
  );
};
