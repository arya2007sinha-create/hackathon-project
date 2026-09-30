import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/auth.api';

export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: 'manager' | 'employee' | 'admin';
  jobTitle: string;
  team: string;
  highlight: string;
  avatarUrl: string;
}

export const DEMO_MANAGERS: DemoAccount[] = [
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@northstar.io',
    password: 'Manager123!',
    role: 'manager',
    jobTitle: 'VP Operations & Engineering',
    team: 'Operations',
    highlight: 'Team health matrix, early warnings & manager overrides',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  },
  {
    name: 'David Kim',
    email: 'david.kim@northstar.io',
    password: 'Manager123!',
    role: 'manager',
    jobTitle: 'Engineering Operations Lead',
    team: 'Engineering',
    highlight: 'Sprint velocity, technical blockers & cross-team cadence',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  },
  {
    name: 'Evelyn Carter',
    email: 'admin@northstar.io',
    password: 'Admin123!',
    role: 'admin',
    jobTitle: 'Chief Technology Officer',
    team: 'Executive',
    highlight: 'Organization-wide analytics, audit logs & compliance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
];

export const DEMO_EMPLOYEES: DemoAccount[] = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@northstar.io',
    password: 'Employee123!',
    role: 'employee',
    jobTitle: 'Senior Integration Engineer',
    team: 'Operations',
    highlight: 'Flagship: Next Best Action & resolving 3 blocked tasks',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    name: 'Aman Verma',
    email: 'aman.verma@northstar.io',
    password: 'Employee123!',
    role: 'employee',
    jobTitle: 'Senior Data Infrastructure Engineer',
    team: 'Data Platform',
    highlight: 'Priority Deviation tracking & sequence adherence warning',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@northstar.io',
    password: 'Employee123!',
    role: 'employee',
    jobTitle: 'Staff Full-Stack Engineer',
    team: 'Engineering',
    highlight: 'Active sprint execution & upstream dependency resolution',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  {
    name: 'Alex Miller',
    email: 'alex.miller@northstar.io',
    password: 'Employee123!',
    role: 'employee',
    jobTitle: 'Enterprise Technical Lead',
    team: 'Customer Success',
    highlight: 'Critical SLA attention alerts & client escalation pipeline',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@northstar.io',
    password: 'Employee123!',
    role: 'employee',
    jobTitle: 'MLOps Architect',
    team: 'Data Platform',
    highlight: 'AI model pipelines & cross-functional analytics tasks',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.vance@northstar.io',
    password: 'Employee123!',
    role: 'employee',
    jobTitle: 'Backend Platform Engineer',
    team: 'Engineering',
    highlight: 'High-throughput microservices & caching performance',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchPersona: (role: 'employee' | 'manager' | 'admin') => Promise<void>;
  loginWithAccount: (account: DemoAccount) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('priora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('priora_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('priora_token');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('priora_user', JSON.stringify(profile));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('priora_token', data.token);
    localStorage.setItem('priora_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('priora_token');
    localStorage.removeItem('priora_user');
  };

  const loginWithAccount = async (account: DemoAccount) => {
    await login(account.email, account.password);
  };

  const switchPersona = async (targetRole: 'employee' | 'manager' | 'admin') => {
    let email = 'rahul.sharma@northstar.io';
    let password = 'Employee123!';

    if (targetRole === 'manager') {
      email = 'sarah.chen@northstar.io';
      password = 'Manager123!';
    } else if (targetRole === 'admin') {
      email = 'admin@northstar.io';
      password = 'Admin123!';
    }

    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchPersona,
        loginWithAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
