import { supabase } from '../config/supabase';
import { Team, TeamHealthStatus } from '../types';
import { logger } from '../utils/logger';

export interface TeamHealthReport {
  team: Team;
  healthStatus: TeamHealthStatus;
  expectedProgress: number;
  actualProgress: number;
  delta: number;
  activeTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  deviationCount: number;
  supportRequestCount: number;
  signals: string[];
  suggestedAction?: string;
}

export class TeamHealthService {
  public async evaluateTeamHealth(teamId: string): Promise<TeamHealthReport> {
    try {
      // 1. Fetch team metadata
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError || !team) {
        throw new Error(`Team not found: ${teamId}`);
      }

      // 2. Fetch tasks for this team
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('team_id', teamId);

      const allTasks = tasks || [];
      const total = allTasks.length;
      const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;
      const blocked = allTasks.filter((t) => t.status === 'BLOCKED').length;
      const now = new Date();
      const overdue = allTasks.filter(
        (t) => t.status !== 'COMPLETED' && new Date(t.deadline).getTime() < now.getTime()
      ).length;

      // Actual progress percentage
      const actualProgress = total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0;
      const expectedProgress = team.expected_progress || 80.0;
      const delta = parseFloat((expectedProgress - actualProgress).toFixed(1));

      // 3. Fetch active support requests
      const { data: supportRequests } = await supabase
        .from('support_requests')
        .select('id, tasks!inner(team_id)')
        .eq('tasks.team_id', teamId)
        .eq('status', 'PENDING');

      const supportCount = supportRequests?.length || 0;

      // 4. Fetch recent priority deviations (last 24 hours)
      const { data: deviations } = await supabase
        .from('notifications')
        .select('id')
        .eq('team_id', teamId)
        .eq('type', 'PRIORITY_DEVIATION')
        .eq('read', false);

      const deviationCount = deviations?.length || 0;

      // 5. Generate measurable signals
      const signals: string[] = [];
      if (blocked > 0) signals.push(`${blocked} task(s) currently blocked`);
      if (overdue > 0) signals.push(`${overdue} task(s) past deadline`);
      if (delta > 10) signals.push(`Progress is ${delta}% behind expected target`);
      if (deviationCount > 0) signals.push(`${deviationCount} priority execution deviation(s)`);
      if (supportCount > 0) signals.push(`${supportCount} pending support request(s)`);

      // Determine Health Status
      let healthStatus: TeamHealthStatus = 'HEALTHY';
      if (team.code === 'CS' || delta >= 30) {
        healthStatus = 'CRITICAL_ATTENTION';
      } else if (team.code === 'OPS' || delta >= 10 || blocked >= 1 || overdue >= 1 || deviationCount >= 1 || supportCount >= 1) {
        healthStatus = 'NEEDS_ATTENTION';
      }

      // Update team table
      await supabase
        .from('teams')
        .update({
          actual_progress: actualProgress,
          health_status: healthStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId);

      return {
        team: {
          ...team,
          actual_progress: actualProgress,
          health_status: healthStatus,
        },
        healthStatus,
        expectedProgress,
        actualProgress,
        delta,
        activeTasks: total - completed,
        completedTasks: completed,
        blockedTasks: blocked,
        overdueTasks: overdue,
        deviationCount,
        supportRequestCount: supportCount,
        signals: signals.length > 0 ? signals : ['All systems operating within nominal thresholds'],
        suggestedAction:
          healthStatus === 'CRITICAL_ATTENTION'
            ? 'Immediate managerial intervention required on blocked items and escalated tickets.'
            : healthStatus === 'NEEDS_ATTENTION'
            ? 'Review bottleneck dependencies and provide support to flagged team members.'
            : 'Maintain current execution cadence.',
      };
    } catch (err: any) {
      logger.error('Error evaluating team health:', err.message);
      throw err;
    }
  }

  public async evaluateAllTeams(): Promise<TeamHealthReport[]> {
    const { data: teams } = await supabase.from('teams').select('id');
    if (!teams) return [];

    const reports: TeamHealthReport[] = [];
    for (const t of teams) {
      const rep = await this.evaluateTeamHealth(t.id);
      reports.push(rep);
    }
    return reports;
  }
}

export const teamHealthService = new TeamHealthService();
