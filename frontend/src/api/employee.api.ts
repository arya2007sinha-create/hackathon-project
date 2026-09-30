import { apiClient } from './client';
import { EmployeeDashboardData, Task, TaskStatus } from '../types';

export const employeeApi = {
  getDashboard: async (): Promise<EmployeeDashboardData> => {
    try {
      const res = await apiClient.get('/employee/dashboard');
      if (res.data?.data) return res.data.data;
    } catch (err) {
      console.warn('Backend unavailable, using cached fallback data for employee dashboard');
    }
    return {
      employee: {
        id: 'b83ed9fc-3f68-4a60-8094-88914db1aa2d',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@northstar.io',
        role: 'employee',
        team_id: '5875275a-faa0-4347-b57e-2cad388556f9',
        job_title: 'Senior Integration Engineer',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        attention_status: 'HEALTHY',
        team: {
          id: '5875275a-faa0-4347-b57e-2cad388556f9',
          code: 'OPS',
          name: 'Operations',
          health_status: 'NEEDS_ATTENTION',
          actual_progress: 68.0,
          expected_progress: 82.0,
          description: 'Payment gateways, transaction processing, platform security, and vendor integrations.',
        },
      },
      nextBestAction: {
        id: 'c1006000-0000-0000-0000-000000001006',
        task_code: 'TSK-1006',
        title: 'Resolve Payment Gateway Concurrency Spike Bottleneck',
        description: 'Core payment gateway integration fails under concurrency; customer checkout SLA risk. Must resolve mutex locking and webhook verification.',
        team_id: '5875275a-faa0-4347-b57e-2cad388556f9',
        priority: 'CRITICAL',
        business_impact: 'CRITICAL',
        deadline: new Date(Date.now() + 18000000).toISOString(),
        estimated_minutes: 60,
        actual_minutes: 15,
        status: 'IN_PROGRESS',
        current_rank: 1,
        priority_score: 96,
        recommendation_reason: 'Highest organizational impact: directly unblocks 3 downstream engineering services and satisfies today 5:00 PM enterprise SLA.',
        reasonSummary: 'Blocks 3 downstream services | Approaching SLA Deadline (5:00 PM) | Manager Override by Sarah Chen',
        factors: [
          { factor: 'Dependency Blocking', description: 'Blocks 3 downstream tasks (API Testing, Reconciliation, Production Deployment)', impact: 'HIGH' },
          { factor: 'SLA Urgency', description: 'Approaching SLA deadline today by 5:00 PM', impact: 'HIGH' },
          { factor: 'Manager Override', description: 'Sarah Chen assigned top rank override due to payment vendor deadline', impact: 'HIGH' },
        ],
      },
      executionPlan: [
        {
          id: 'c1006000-0000-0000-0000-000000001006',
          task_code: 'TSK-1006',
          title: 'Resolve Payment Gateway Concurrency Spike Bottleneck',
          team_id: '5875275a-faa0-4347-b57e-2cad388556f9',
          priority: 'CRITICAL',
          business_impact: 'CRITICAL',
          deadline: new Date(Date.now() + 18000000).toISOString(),
          estimated_minutes: 60,
          actual_minutes: 15,
          status: 'IN_PROGRESS',
          current_rank: 1,
          priority_score: 96,
          reasonSummary: 'Blocks 3 downstream tasks | SLA today 5:00 PM',
        },
        {
          id: 'c1007000-0000-0000-0000-000000001007',
          task_code: 'TSK-1007',
          title: 'Database Schema Index Optimization for High-Concurrency Triggers',
          team_id: '5875275a-faa0-4347-b57e-2cad388556f9',
          priority: 'HIGH',
          business_impact: 'HIGH',
          deadline: new Date(Date.now() + 36000000).toISOString(),
          estimated_minutes: 45,
          actual_minutes: 0,
          status: 'NOT_STARTED',
          current_rank: 2,
          priority_score: 84,
          reasonSummary: 'Reduces database locking during batch transaction processing',
        },
        {
          id: 'c1008000-0000-0000-0000-000000001008',
          task_code: 'TSK-1008',
          title: 'Setup Prometheus Telemetry Metrics for Outbound Microservices',
          team_id: '5875275a-faa0-4347-b57e-2cad388556f9',
          priority: 'MEDIUM',
          business_impact: 'MEDIUM',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          estimated_minutes: 30,
          actual_minutes: 0,
          status: 'NOT_STARTED',
          current_rank: 3,
          priority_score: 68,
          reasonSummary: 'Improves observability across edge gateways',
        },
        {
          id: 'c1009000-0000-0000-0000-000000001009',
          task_code: 'TSK-1009',
          title: 'Update User Role Permissions Audit Table',
          team_id: '5875275a-faa0-4347-b57e-2cad388556f9',
          priority: 'LOW',
          business_impact: 'LOW',
          deadline: new Date(Date.now() + 172800000).toISOString(),
          estimated_minutes: 20,
          actual_minutes: 0,
          status: 'NOT_STARTED',
          current_rank: 4,
          priority_score: 42,
          reasonSummary: 'Routine compliance audit trail update',
        },
      ],
      progress: {
        totalTasks: 8,
        completedTasks: 4,
        inProgressTasks: 1,
        blockedCount: 0,
        progressPercent: 50,
        remainingMinutes: 155,
        formattedRemainingTime: '2h 35m',
      },
      yesterday: {
        completed: 7,
        incomplete: 3,
        carriedForward: 2,
        message: '2 tasks were automatically carried forward into today’s execution plan.',
      },
      blockers: [],
      notifications: [],
    };
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
