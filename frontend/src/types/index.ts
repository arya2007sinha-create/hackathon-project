export type UserRole = 'employee' | 'manager' | 'admin';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BusinessImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'NEEDS_HELP'
  | 'OVERDUE'
  | 'CANCELLED';

export type TeamHealthStatus = 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL_ATTENTION';
export type AttentionStatus = 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL_ATTENTION';
export type NotificationSeverity = 'RED' | 'ORANGE' | 'BLUE' | 'GRAY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id?: string;
  team?: Team;
  job_title: string;
  avatar_url?: string;
  attention_status: AttentionStatus;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  health_status: TeamHealthStatus;
  expected_progress: number;
  actual_progress: number;
  active_tasks?: number;
  completed_tasks?: number;
  blocked_tasks?: number;
  signals?: string[];
  suggestedAction?: string;
}

export interface ExplainableFactor {
  factor: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Task {
  id: string;
  task_code?: string;
  title: string;
  description?: string;
  project_id?: string;
  project?: { id: string; name: string };
  team_id: string;
  team?: { id: string; name: string };
  assigned_to?: string;
  assigned_user?: { id: string; name: string; avatar_url?: string };
  priority: TaskPriority;
  business_impact: BusinessImpact;
  deadline: string;
  estimated_minutes: number;
  actual_minutes: number;
  status: TaskStatus;
  blocked_reason?: string;
  blocked_category?: string;
  current_rank?: number;
  rank?: number;
  priority_score?: number;
  recommendation_reason?: string;
  reasonSummary?: string;
  factors?: ExplainableFactor[];
  blocking_count?: number;
  is_carried_forward?: boolean;
  isManagerOverridden?: boolean;
  overrideReason?: string;
  started_at?: string;
  completed_at?: string;
  dependencies?: any[];
}

export interface NotificationItem {
  id: string;
  type: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  task_id?: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface EmployeeDashboardData {
  employee: User;
  nextBestAction: Task | null;
  executionPlan: Task[];
  progress: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedCount: number;
    progressPercent: number;
    remainingMinutes: number;
    formattedRemainingTime: string;
  };
  yesterday: {
    completed: number;
    incomplete: number;
    carriedForward: number;
    message: string;
  };
  blockers: Task[];
  notifications: NotificationItem[];
}

export interface ManagementDashboardData {
  metrics: {
    totalEmployees: number;
    activeTasks: number;
    completedToday: number;
    blocked: number;
    overdue: number;
    attentionSignals: number;
  };
  teamHealth: Team[];
  attentionCenter: NotificationItem[];
  earlyWarning: {
    teamName: string;
    status: TeamHealthStatus;
    expectedProgress: number;
    currentProgress: number;
    delta: number;
    contributingSignals: string[];
    suggestedInvestigationArea: string;
    investigationTaskId?: string;
  };
  priorityAdherenceSpotlight: {
    title: string;
    employee: string;
    team: string;
    recommended: string;
    actual: string;
    elapsedMinutes: number;
    status: string;
    contextualNotes: string;
  };
  employeeGrid: Array<{
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    teamName: string;
    progress: number;
    activeTasks: number;
    blockedTasks: number;
    priorityAdherence: number;
    attentionStatus: AttentionStatus;
  }>;
  recentEvents: Array<{
    id: string;
    type: string;
    taskTitle: string;
    userName: string;
    metadata: any;
    createdAt: string;
  }>;
}
