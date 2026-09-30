"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adherenceService = exports.AdherenceService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
class AdherenceService {
    /**
     * Check if starting a task is a priority deviation
     */
    async checkTaskStartAdherence(userId, startedTaskId) {
        try {
            // 1. Get current active tasks for this user ordered by rank
            const { data: userTasks, error } = await supabase_1.supabase
                .from('tasks')
                .select('id, title, current_rank, status, team_id')
                .eq('assigned_to', userId)
                .in('status', ['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_HELP'])
                .order('current_rank', { ascending: true });
            if (error || !userTasks || userTasks.length <= 1) {
                return { isDeviation: false };
            }
            const startedTask = userTasks.find((t) => t.id === startedTaskId);
            if (!startedTask)
                return { isDeviation: false };
            // Recommended task is the uncompleted, non-blocked task with the lowest rank (Rank 1)
            const topRecommended = userTasks[0];
            // If started task rank is strictly greater than top recommended rank
            if (topRecommended.id !== startedTaskId && (startedTask.current_rank || 999) > (topRecommended.current_rank || 1)) {
                const message = `Task #${startedTask.current_rank} ("${startedTask.title}") was started before currently recommended Task #${topRecommended.current_rank} ("${topRecommended.title}").`;
                // 2. Fetch user and team info
                const { data: user } = await supabase_1.supabase
                    .from('users')
                    .select('name, team_id')
                    .eq('id', userId)
                    .single();
                // 3. Log execution event
                await supabase_1.supabase.from('task_execution_events').insert({
                    task_id: startedTaskId,
                    user_id: userId,
                    event_type: 'PRIORITY_DEVIATION',
                    metadata: {
                        startedTaskId,
                        startedTitle: startedTask.title,
                        startedRank: startedTask.current_rank,
                        recommendedTaskId: topRecommended.id,
                        recommendedTitle: topRecommended.title,
                        recommendedRank: topRecommended.current_rank,
                        message,
                    },
                });
                // 4. Create management notification
                await supabase_1.supabase.from('notifications').insert({
                    user_id: userId,
                    team_id: user?.team_id || startedTask.team_id,
                    type: 'PRIORITY_DEVIATION',
                    severity: 'ORANGE',
                    title: 'Priority Deviation Detected',
                    message: `${user?.name || 'Employee'}: ${message}`,
                    task_id: startedTaskId,
                    action_url: `/management/tasks?id=${startedTaskId}`,
                });
                logger_1.logger.info(`Priority deviation recorded for user ${userId}: ${message}`);
                return {
                    isDeviation: true,
                    recommendedTaskId: topRecommended.id,
                    recommendedRank: topRecommended.current_rank,
                    actualRank: startedTask.current_rank,
                    message,
                };
            }
            return { isDeviation: false };
        }
        catch (err) {
            logger_1.logger.error('Error in checkTaskStartAdherence:', err.message);
            return { isDeviation: false };
        }
    }
    /**
     * Calculate employee's priority adherence percentage
     */
    async calculateEmployeeAdherence(userId) {
        try {
            const { data: events } = await supabase_1.supabase
                .from('task_execution_events')
                .select('event_type')
                .eq('user_id', userId);
            if (!events || events.length === 0)
                return 94;
            const starts = events.filter((e) => e.event_type === 'TASK_STARTED').length;
            const deviations = events.filter((e) => e.event_type === 'PRIORITY_DEVIATION').length;
            if (starts === 0)
                return 92;
            return Math.max(40, Math.min(100, Math.round(((starts - deviations) / starts) * 100)));
        }
        catch (err) {
            logger_1.logger.error('Error calculating adherence:', err.message);
            return 90;
        }
    }
}
exports.AdherenceService = AdherenceService;
exports.adherenceService = new AdherenceService();
