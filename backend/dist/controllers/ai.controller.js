"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AiController = void 0;
const supabase_1 = require("../config/supabase");
const managementInsight_service_1 = require("../ai/managementInsight.service");
const priorityExplanation_service_1 = require("../ai/priorityExplanation.service");
const priorityEngine_service_1 = require("../services/priorityEngine.service");
const response_1 = require("../utils/response");
class AiController {
    async askAssistant(req, res) {
        try {
            const { query } = req.body;
            if (!query || typeof query !== 'string') {
                return (0, response_1.sendError)(res, 'A question is required', 'INVALID_QUERY', 400);
            }
            // Gather live operational context
            const { data: teams } = await supabase_1.supabase.from('teams').select('*');
            const { data: notifications } = await supabase_1.supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            const { data: blockedTasks } = await supabase_1.supabase
                .from('tasks')
                .select('*, assigned_user:users(name)')
                .eq('status', 'BLOCKED');
            const { data: deviations } = await supabase_1.supabase
                .from('notifications')
                .select('*')
                .eq('type', 'PRIORITY_DEVIATION');
            // Top bottlenecks
            const { data: allDeps } = await supabase_1.supabase
                .from('task_dependencies')
                .select('depends_on_task_id, tasks!task_dependencies_depends_on_task_id_fkey(title)');
            const depCounts = new Map();
            allDeps?.forEach((d) => {
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
            const response = await managementInsight_service_1.managementInsightService.answerManagementQuery(query, {
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
            return (0, response_1.sendSuccess)(res, response, 'AI query processed');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'AI_ASSISTANT_ERROR', 500);
        }
    }
    async explain(req, res) {
        try {
            const { taskId } = req.body;
            if (!taskId) {
                return (0, response_1.sendError)(res, 'Task ID is required', 'MISSING_TASK_ID', 400);
            }
            const { data: task, error } = await supabase_1.supabase
                .from('tasks')
                .select('*')
                .eq('id', taskId)
                .single();
            if (error || !task) {
                return (0, response_1.sendError)(res, 'Task not found', 'NOT_FOUND', 404);
            }
            // Check blocking count
            const { count } = await supabase_1.supabase
                .from('task_dependencies')
                .select('*', { count: 'exact', head: true })
                .eq('depends_on_task_id', taskId);
            const explanation = await priorityExplanation_service_1.priorityExplanationService.explainNextBestAction(task, count || 0);
            return (0, response_1.sendSuccess)(res, explanation, 'Explanation generated successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'EXPLAIN_ERROR', 500);
        }
    }
    async prioritize(req, res) {
        try {
            const { employeeId } = req.body;
            const targetUserId = employeeId || req.user?.userId;
            if (!targetUserId) {
                return (0, response_1.sendError)(res, 'Target employee ID is required', 'MISSING_USER_ID', 400);
            }
            const scored = await priorityEngine_service_1.priorityEngineService.recalculateEmployeeTasks(targetUserId);
            return (0, response_1.sendSuccess)(res, scored, 'Tasks prioritized successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'PRIORITIZATION_ERROR', 500);
        }
    }
}
exports.AiController = AiController;
exports.aiController = new AiController();
