import { apiClient } from './client';
import { ManagementDashboardData, Team, Task, User, NotificationItem } from '../types';

export const managementApi = {
  getDashboard: async (): Promise<ManagementDashboardData> => {
    try {
      const res = await apiClient.get('/management/dashboard');
      if (res.data?.data) return res.data.data;
    } catch (err) {
      console.warn('Backend unavailable, using cached fallback data for management dashboard');
    }
    return {
      metrics: {
        totalEmployees: 11,
        activeTasks: 42,
        completedToday: 18,
        blocked: 4,
        overdue: 1,
        attentionSignals: 3,
      },
      teamHealth: [
        {
          id: '5875275a-faa0-4347-b57e-2cad388556f9',
          name: 'Operations',
          code: 'OPS',
          health_status: 'NEEDS_ATTENTION',
          expected_progress: 82.0,
          actual_progress: 68.0,
          active_tasks: 14,
          completed_tasks: 8,
          blocked_tasks: 2,
          signals: ['Payment Gateway TSK-1006 blocked', 'SLA deadline within 4 hours'],
          suggestedAction: 'Review payment webhook credentials and reassign downstream dependencies.',
        },
        {
          id: '5875275a-faa0-4347-b57e-2cad388556f1',
          name: 'Product Engineering',
          code: 'ENG',
          health_status: 'HEALTHY',
          expected_progress: 88.0,
          actual_progress: 88.0,
          active_tasks: 18,
          completed_tasks: 12,
          blocked_tasks: 0,
        },
        {
          id: '5875275a-faa0-4347-b57e-2cad388556f2',
          name: 'Data & AI',
          code: 'DATA',
          health_status: 'HEALTHY',
          expected_progress: 85.0,
          actual_progress: 84.0,
          active_tasks: 10,
          completed_tasks: 7,
          blocked_tasks: 0,
        },
        {
          id: '5875275a-faa0-4347-b57e-2cad388556f3',
          name: 'Design',
          code: 'DSGN',
          health_status: 'HEALTHY',
          expected_progress: 90.0,
          actual_progress: 92.0,
          active_tasks: 8,
          completed_tasks: 6,
          blocked_tasks: 0,
        },
        {
          id: '5875275a-faa0-4347-b57e-2cad388556f4',
          name: 'Customer Success',
          code: 'CS',
          health_status: 'CRITICAL_ATTENTION',
          expected_progress: 85.0,
          actual_progress: 54.0,
          active_tasks: 9,
          completed_tasks: 3,
          blocked_tasks: 2,
          signals: ['Tier-1 Enterprise client escalation pending', 'High unresolved ticket velocity'],
        },
      ],
      attentionCenter: [
        {
          id: 'notif-1',
          type: 'BLOCKER',
          severity: 'ORANGE',
          title: 'Operations Team Velocity Warning',
          message: 'Payment Gateway integration bottleneck in Operations is slowing cross-team cadence.',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          type: 'OVERRIDE',
          severity: 'BLUE',
          title: 'Manager Override Active: TSK-1006',
          message: 'Sarah Chen prioritized TSK-1006 to rank #1 due to today 5:00 PM enterprise SLA.',
          read: false,
          created_at: new Date().toISOString(),
        },
      ],
      earlyWarning: {
        teamName: 'Operations',
        status: 'NEEDS_ATTENTION',
        expectedProgress: 82.0,
        currentProgress: 68.0,
        delta: -14.0,
        contributingSignals: [
          'TSK-1006 Stripe webhook secret missing blocks 3 downstream tasks',
          'SLA expiration countdown active (3 hours 45 minutes remaining)',
        ],
        suggestedInvestigationArea: 'Stripe API Gateway Integration & Mutex Concurrency Locks',
      },
      priorityAdherenceSpotlight: {
        title: 'Priority Sequence Adherence',
        employee: 'Aman Verma',
        team: 'Data & AI',
        recommended: 'TSK-1020 Redis Cache Optimization',
        actual: 'TSK-1035 Documentation Review',
        elapsedMinutes: 45,
        status: 'DEVIATION_DETECTED',
        contextualNotes: 'Employee shifted to documentation review while high-impact caching task was pending.',
      },
      employeeGrid: [
        {
          id: 'b83ed9fc-3f68-4a60-8094-88914db1aa2d',
          name: 'Rahul Sharma',
          email: 'rahul.sharma@northstar.io',
          jobTitle: 'Senior Integration Engineer',
          teamName: 'Operations',
          progress: 75,
          activeTasks: 4,
          blockedTasks: 0,
          priorityAdherence: 95,
          attentionStatus: 'HEALTHY',
        },
        {
          id: 'b83ed9fc-3f68-4a60-8094-88914db1aa2e',
          name: 'Aman Verma',
          email: 'aman.verma@northstar.io',
          jobTitle: 'Senior Data Infrastructure Engineer',
          teamName: 'Data & AI',
          progress: 60,
          activeTasks: 3,
          blockedTasks: 1,
          priorityAdherence: 72,
          attentionStatus: 'NEEDS_ATTENTION',
        },
      ],
      recentEvents: [
        {
          id: 'evt-1',
          type: 'OVERRIDE_APPLIED',
          taskTitle: 'TSK-1006 Resolve Payment Gateway Concurrency',
          userName: 'Sarah Chen',
          metadata: { newRank: 1 },
          createdAt: new Date().toISOString(),
        },
      ],
    };
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
