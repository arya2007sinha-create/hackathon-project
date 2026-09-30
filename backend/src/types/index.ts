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

export type TaskEventType =
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_STARTED'
  | 'TASK_PAUSED'
  | 'TASK_COMPLETED'
  | 'TASK_BLOCKED'
  | 'HELP_REQUESTED'
  | 'PRIORITY_CHANGED'
  | 'PRIORITY_DEVIATION'
  | 'MANAGER_OVERRIDE'
  | 'DEADLINE_CHANGED'
  | 'DEPENDENCY_CHANGED';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  team_id: string | null;
  job_title: string;
  avatar_url?: string;
  is_active: boolean;
  attention_status: AttentionStatus;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  lead_id?: string;
  health_status: TeamHealthStatus;
  expected_progress: number;
  actual_progress: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  team_id: string;
  priority: TaskPriority;
  status: string;
  target_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  task_code?: string;
  title: string;
  description?: string;
  project_id?: string;
  team_id: string;
  assigned_to?: string;
  created_by?: string;
  priority: TaskPriority;
  business_impact: BusinessImpact;
  deadline: string;
  estimated_minutes: number;
  actual_minutes: number;
  status: TaskStatus;
  blocked_reason?: string;
  blocked_category?: string;
  current_rank?: number;
  priority_score?: number;
  recommendation_reason?: string;
  is_carried_forward?: boolean;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  // Joins
  project?: Project;
  assigned_user?: User;
  dependencies?: Task[];
  blocked_by?: Task[];
  blocking_count?: number;
  manager_override?: ManagerOverride;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at: string;
}

export interface ManagerOverride {
  id: string;
  task_id: string;
  manager_id: string;
  previous_rank: number;
  new_rank: number;
  reason: string;
  active: boolean;
  created_at: string;
  manager_name?: string;
}

export interface SupportRequest {
  id: string;
  task_id: string;
  employee_id: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED';
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  team_id?: string;
  type: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  task_id?: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface PriorityRecommendation {
  id: string;
  task_id: string;
  employee_id: string;
  recommendation_version: number;
  rank: number;
  priority_score: number;
  reason_summary: string;
  factors: Array<{ factor: string; description: string; impact: 'HIGH' | 'MEDIUM' | 'LOW' }>;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  teamId?: string | null;
  name: string;
}
