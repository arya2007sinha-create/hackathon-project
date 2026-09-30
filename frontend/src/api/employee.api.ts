import { apiClient } from './client';
import { EmployeeDashboardData, Task, TaskStatus } from '../types';

export const employeeApi = {
  getDashboard: async (): Promise<EmployeeDashboardData> => {
    const res = await apiClient.get('/employee/dashboard');
    return res.data.data;
  },

  getTasks: async (status?: string): Promise<Task[]> => {
    const res = await apiClient.get('/employee/tasks', { params: { status } });
    return res.data.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const res = await apiClient.get(`/employee/tasks/${id}`);
    return res.data.data;
  },

  updateStatus: async (id: string, status: TaskStatus, reason?: string): Promise<Task> => {
    const res = await apiClient.patch(`/employee/tasks/${id}/status`, { status, reason });
    return res.data.data;
  },

  blockTask: async (
    id: string,
    blockedCategory: string,
    blockedReason: string,
    requestSupport: boolean = true
  ): Promise<Task> => {
    const res = await apiClient.post(`/employee/tasks/${id}/block`, {
      blockedCategory,
      blockedReason,
      requestSupport,
    });
    return res.data.data;
  },

  requestHelp: async (id: string, details: string): Promise<Task> => {
    const res = await apiClient.post(`/employee/tasks/${id}/help`, { details });
    return res.data.data;
  },

  recalculatePriorities: async (): Promise<any[]> => {
    const res = await apiClient.post('/employee/tasks/dummy/suggest-priority');
    return res.data.data;
  },
};
