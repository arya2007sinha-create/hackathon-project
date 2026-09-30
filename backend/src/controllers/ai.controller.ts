import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { managementInsightService } from '../ai/managementInsight.service';
import { priorityExplanationService } from '../ai/priorityExplanation.service';
import { priorityEngineService } from '../services/priorityEngine.service';
import { sendSuccess, sendError } from '../utils/response';

export class AiController {
  public async askAssistant(req: Request, res: Response) {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return sendError(res, 'A question is required', 'INVALID_QUERY', 400);
      }

      // Gather live operational context
      const { data: teams } = await supabase.from('teams').select('*');
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: blockedTasks } = await supabase
        .from('tasks')
        .select('*, assigned_user:users(name)')
        .eq('status', 'BLOCKED');

      const { data: deviations } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'PRIORITY_DEVIATION');

      // Top bottlenecks
      const { data: allDeps } = await supabase
        .from('task_dependencies')
        .select('depends_on_task_id, tasks!task_dependencies_depends_on_task_id_fkey(title)');

      const depCounts = new Map<string, { title: string; count: number }>();
      allDeps?.forEach((d: any) => {
        const id = d.depends_on_task_id;
        const existing = depCounts.get(id) || { title: d.tasks?.title || 'Unknown', count: 0 };
        existing.count += 1;
        depCounts.set(id, existing);
      });

      const bottlenecks = Array.from(depCounts.entries()).map(([id, val]) => ({
        id,
        title: val.title,
        blocking_count: val.count,
      }));

      const response = await managementInsightService.answerManagementQuery(query, {
        teams: teams || [],
        attentionSignals: notifications || [],
        blockedTasks: (blockedTasks || []).map((b) => ({
          ...b,
          assigned_name: b.assigned_user?.name,
        })),
        deviations: (deviations || []).map((d) => ({
          employee_name: d.title,
          team_name: 'Operations',
          message: d.message,
        })),
        bottlenecks,
      });

      return sendSuccess(res, response, 'AI query processed');
    } catch (err: any) {
      return sendError(res, err.message, 'AI_ASSISTANT_ERROR', 500);
    }
  }

  public async explain(req: Request, res: Response) {
    try {
      const { taskId } = req.body;
      if (!taskId) {
        return sendError(res, 'Task ID is required', 'MISSING_TASK_ID', 400);
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error || !task) {
        return sendError(res, 'Task not found', 'NOT_FOUND', 404);
      }

      // Check blocking count
      const { count } = await supabase
        .from('task_dependencies')
        .select('*', { count: 'exact', head: true })
        .eq('depends_on_task_id', taskId);

      const explanation = await priorityExplanationService.explainNextBestAction(
        task,
        count || 0
      );

      return sendSuccess(res, explanation, 'Explanation generated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 'EXPLAIN_ERROR', 500);
    }
  }

  public async prioritize(req: Request, res: Response) {
    try {
      const { employeeId } = req.body;
      const targetUserId = employeeId || req.user?.userId;

      if (!targetUserId) {
        return sendError(res, 'Target employee ID is required', 'MISSING_USER_ID', 400);
      }

      const scored = await priorityEngineService.recalculateEmployeeTasks(targetUserId);
      return sendSuccess(res, scored, 'Tasks prioritized successfully');
    } catch (err: any) {
      return sendError(res, err.message, 'PRIORITIZATION_ERROR', 500);
    }
  }
}

export const aiController = new AiController();
