"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = exports.EmployeeController = void 0;
const supabase_1 = require("../config/supabase");
const priorityEngine_service_1 = require("../services/priorityEngine.service");
const task_service_1 = require("../services/task.service");
const response_1 = require("../utils/response");
class EmployeeController {
    async getDashboard(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return (0, response_1.sendError)(res, 'User ID missing in token', 'UNAUTHORIZED', 401);
            }
            // 1. Fetch user info
            const { data: user } = await supabase_1.supabase
                .from('users')
                .select('*, team:teams!users_team_id_fkey(*)')
                .eq('id', userId)
                .single();
            // 2. Run or retrieve latest prioritized tasks
            const scoredTasks = await priorityEngine_service_1.priorityEngineService.recalculateEmployeeTasks(userId);
            // 3. Separate top task (Next Best Action) from the rest
            const activeScoredTasks = scoredTasks.filter((st) => st.task.status !== 'COMPLETED' && st.task.status !== 'CANCELLED');
            const nextBestAction = activeScoredTasks.length > 0 ? activeScoredTasks[0] : null;
            // 4. Calculate today's progress & remaining workload
            const allEmployeeTasks = scoredTasks.map((st) => st.task);
            const totalTasks = allEmployeeTasks.length;
            const completedTasks = allEmployeeTasks.filter((t) => t.status === 'COMPLETED').length;
            const inProgressTasks = allEmployeeTasks.filter((t) => t.status === 'IN_PROGRESS').length;
            const blockedTasks = allEmployeeTasks.filter((t) => t.status === 'BLOCKED');
            const remainingMinutes = allEmployeeTasks
                .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
                .reduce((acc, t) => acc + (t.estimated_minutes || 60), 0);
            const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            // 5. Fetch or provide yesterday's summary
            const { data: dailySummary } = await supabase_1.supabase
                .from('daily_summaries')
                .select('*')
                .eq('employee_id', userId)
                .order('date', { ascending: false })
                .limit(1)
                .maybeSingle();
            const yesterday = {
                completed: dailySummary?.completed_count ?? 7,
                incomplete: dailySummary?.incomplete_count ?? 3,
                carriedForward: dailySummary?.carried_forward_count ?? 2,
                message: '2 tasks were automatically carried forward into today’s execution plan.',
            };
            // 6. Fetch user notifications
            const { data: notifications } = await supabase_1.supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            return (0, response_1.sendSuccess)(res, {
                employee: {
                    id: user?.id,
                    name: user?.name,
                    role: user?.role,
                    team: user?.team,
                    jobTitle: user?.job_title,
                    avatarUrl: user?.avatar_url,
                    attentionStatus: user?.attention_status || 'HEALTHY',
                },
                nextBestAction: nextBestAction
                    ? {
                        ...nextBestAction.task,
                        rank: nextBestAction.rank,
                        priorityScore: nextBestAction.priorityScore,
                        reasonSummary: nextBestAction.reasonSummary,
                        factors: nextBestAction.factors,
                        isManagerOverridden: nextBestAction.isManagerOverridden,
                        overrideReason: nextBestAction.overrideReason,
                    }
                    : null,
                executionPlan: scoredTasks.map((st) => ({
                    ...st.task,
                    rank: st.rank,
                    priorityScore: st.priorityScore,
                    reasonSummary: st.reasonSummary,
                    factors: st.factors,
                    isManagerOverridden: st.isManagerOverridden,
                    overrideReason: st.overrideReason,
                })),
                progress: {
                    totalTasks,
                    completedTasks,
                    inProgressTasks,
                    blockedCount: blockedTasks.length,
                    progressPercent,
                    remainingMinutes,
                    formattedRemainingTime: `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`,
                },
                yesterday,
                blockers: blockedTasks,
                notifications: notifications || [],
            }, 'Employee dashboard retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'DASHBOARD_ERROR', 500);
        }
    }
    async getTasks(req, res) {
        try {
            const userId = req.user?.userId;
            const { status } = req.query;
            let query = supabase_1.supabase
                .from('tasks')
                .select('*, project:projects(*)')
                .eq('assigned_to', userId)
                .order('current_rank', { ascending: true });
            if (status) {
                query = query.eq('status', status);
            }
            const { data: tasks, error } = await query;
            if (error)
                throw error;
            return (0, response_1.sendSuccess)(res, tasks, 'Tasks retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'TASKS_FETCH_ERROR', 500);
        }
    }
    async getTaskById(req, res) {
        try {
            const id = req.params.id;
            const { data: task, error } = await supabase_1.supabase
                .from('tasks')
                .select(`
          *,
          project:projects(*),
          dependencies:task_dependencies!task_dependencies_task_id_fkey(
            depends_on:tasks!task_dependencies_depends_on_task_id_fkey(*)
          )
        `)
                .eq('id', id)
                .single();
            if (error || !task) {
                return (0, response_1.sendError)(res, 'Task not found', 'NOT_FOUND', 404);
            }
            return (0, response_1.sendSuccess)(res, task, 'Task retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'TASK_DETAIL_ERROR', 500);
        }
    }
    async updateTaskStatus(req, res) {
        try {
            const id = req.params.id;
            const { status, reason } = req.body;
            const userId = req.user?.userId;
            const updated = await task_service_1.taskService.updateTaskStatus(id, status, userId, reason);
            return (0, response_1.sendSuccess)(res, updated, `Task marked as ${status}`);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'STATUS_UPDATE_ERROR', 500);
        }
    }
    async blockTask(req, res) {
        try {
            const id = req.params.id;
            const { blockedCategory, blockedReason, requestSupport } = req.body;
            const userId = req.user?.userId;
            const updated = await task_service_1.taskService.blockTask(id, userId, {
                blockedCategory,
                blockedReason,
                requestSupport,
            });
            return (0, response_1.sendSuccess)(res, updated, 'Task marked as blocked and management alert generated');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'BLOCK_TASK_ERROR', 500);
        }
    }
    async requestHelp(req, res) {
        try {
            const id = req.params.id;
            const { details } = req.body;
            const userId = req.user?.userId;
            // Mark task as NEEDS_HELP
            const updated = await task_service_1.taskService.updateTaskStatus(id, 'NEEDS_HELP', userId, details);
            // Create support ticket
            await supabase_1.supabase.from('support_requests').insert({
                task_id: id,
                employee_id: userId,
                reason: 'Employee requested assistance',
                details,
                status: 'PENDING',
            });
            return (0, response_1.sendSuccess)(res, updated, 'Support request submitted to management');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'HELP_REQUEST_ERROR', 500);
        }
    }
    async recalculatePriorities(req, res) {
        try {
            const userId = req.user?.userId;
            const scored = await priorityEngine_service_1.priorityEngineService.recalculateEmployeeTasks(userId);
            return (0, response_1.sendSuccess)(res, scored, 'Priority recommendations refreshed');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'RECALCULATE_ERROR', 500);
        }
    }
}
exports.EmployeeController = EmployeeController;
exports.employeeController = new EmployeeController();
