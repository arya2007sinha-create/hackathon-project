import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { ArrowRight, Lock, Mail, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchPersona } = useAuth();
  const [email, setEmail] = useState('rahul.sharma@northstar.io');
  const [password, setPassword] = useState('Employee123!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      if (email.includes('sarah') || email.includes('admin')) {
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

  const handleQuickDemo = async (role: 'employee' | 'manager' | 'admin') => {
    setIsLoading(true);
    try {
      await switchPersona(role);
      if (role === 'manager' || role === 'admin') {
        navigate('/management/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch {
      setError('Failed to log in with demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-sm mx-auto mb-3">
          <span className="text-accent-light">P</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">PRIORA</h1>
        <p className="text-xs uppercase font-semibold tracking-wider text-accent mt-0.5">
          Intelligent Work Orchestration
        </p>
        <p className="text-xs text-secondary mt-2 max-w-sm mx-auto">
          "Employees shouldn't have to spend mental energy deciding what to work on next, while managers shouldn't discover execution problems after they become critical."
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border py-8 px-6 shadow-card rounded-2xl sm:px-10">
          {/* Quick Demo Access Cards */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2 text-center">
              1-Click Hackathon Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('employee')}
                className="p-3 text-left border border-border rounded-xl hover:border-accent hover:bg-slate-50 transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <span>Rahul Sharma</span>
                </div>
                <p className="text-[10px] text-secondary">Employee (Operations)</p>
                <span className="text-[10px] text-accent font-semibold flex items-center gap-1 mt-1">
                  <span>Demo View</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="p-3 text-left border border-border rounded-xl hover:border-accent hover:bg-slate-50 transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <span>Sarah Chen</span>
                </div>
                <p className="text-[10px] text-secondary">VP Operations (Manager)</p>
                <span className="text-[10px] text-accent font-semibold flex items-center gap-1 mt-1">
                  <span>Demo View</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold text-secondary">
              <span className="bg-card px-2">Or log in with credentials</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-status-criticalBorder text-status-critical text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-secondary absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-secondary mt-6">
          PRIORA Enterprise Work Orchestration Platform &bull; Northstar Technologies &bull; Hackathon Edition
        </p>
      </div>
    </div>
  );
};
