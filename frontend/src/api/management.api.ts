import { apiClient } from './client';
import { ManagementDashboardData, Team, Task, User, NotificationItem } from '../types';

export const managementApi = {
  getDashboard: async (): Promise<ManagementDashboardData> => {
    const res = await apiClient.get('/management/dashboard');
    return res.data.data;
  },

  getTeams: async (): Promise<Team[]> => {
    const res = await apiClient.get('/management/teams');
    return res.data.data;
  },

  getTeamById: async (id: string): Promise<any> => {
    const res = await apiClient.get(`/management/teams/${id}`);
    return res.data.data;
  },

  getEmployees: async (): Promise<User[]> => {
    const res = await apiClient.get('/management/employees');
    return res.data.data;
  },

  getEmployeeById: async (id: string): Promise<any> => {
    const res = await apiClient.get(`/management/employees/${id}`);
    return res.data.data;
  },

  getTasks: async (params?: { teamId?: string; employeeId?: string; status?: string; search?: string }): Promise<Task[]> => {
    const res = await apiClient.get('/management/tasks', { params });
    return res.data.data;
  },

  createTask: async (taskData: any): Promise<Task> => {
    const res = await apiClient.post('/management/tasks', taskData);
    return res.data.data;
  },

  createOverride: async (taskId: string, newRank: number, reason: string): Promise<any> => {
    const res = await apiClient.post(`/management/tasks/${taskId}/override`, { newRank, reason });
    return res.data.data;
  },

  getAlerts: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get('/management/alerts');
    return res.data.data;
  },

  getAnalytics: async (timeRange: string = '7D'): Promise<any> => {
    const res = await apiClient.get('/management/analytics', { params: { timeRange } });
    return res.data.data;
  },
};
