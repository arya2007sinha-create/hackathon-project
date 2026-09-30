import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeTasksPage } from './pages/employee/EmployeeTasksPage';
import { ManagementDashboard } from './pages/management/ManagementDashboard';
import { TeamDetail } from './pages/management/TeamDetail';
import { EmployeeDetail } from './pages/management/EmployeeDetail';
import { TasksManagement } from './pages/management/TasksManagement';
import { Analytics } from './pages/management/Analytics';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-secondary text-xs">
        Loading PRIORA Session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'manager' && user.role !== 'manager' && user.role !== 'admin') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'manager' || user.role === 'admin') {
    return <Navigate to="/management/dashboard" replace />;
  }
  return <Navigate to="/employee/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<RootRedirect />} />
            
            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/tasks" element={<EmployeeTasksPage />} />

            {/* Management Routes */}
            <Route
              path="/management/dashboard"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ManagementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management/teams"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ManagementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management/teams/:id"
              element={
                <ProtectedRoute requiredRole="manager">
                  <TeamDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management/employees/:id"
              element={
                <ProtectedRoute requiredRole="manager">
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management/tasks"
              element={
                <ProtectedRoute requiredRole="manager">
                  <TasksManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management/analytics"
              element={
                <ProtectedRoute requiredRole="manager">
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
