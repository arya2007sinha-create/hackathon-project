"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priorityEngineService = exports.PriorityEngineService = void 0;
const supabase_1 = require("../config/supabase");
const priorityExplanation_service_1 = require("../ai/priorityExplanation.service");
const logger_1 = require("../utils/logger");
class PriorityEngineService {
    /**
     * Calculate Priority Score for a task:
     * Score = Manager Priority + Deadline Urgency + Business Impact + Dependency Impact + Blocking Impact + Carry-over Impact + Project Importance
     */
    calculateDeterministicScore(task, blockingCount = 0, hasUnresolvedUpstreamDependencies = false) {
        // 1. Manager Priority (Max 30)
        let managerWeight = 15;
        if (task.priority === 'CRITICAL')
            managerWeight = 30;
        else if (task.priority === 'HIGH')
            managerWeight = 22;
        else if (task.priority === 'MEDIUM')
            managerWeight = 15;
        else if (task.priority === 'LOW')
            managerWeight = 8;
        // 2. Deadline Urgency (Max 25)
        let deadlineWeight = 10;
        const now = new Date().getTime();
        const deadline = new Date(task.deadline).getTime();
        const hoursRemaining = (deadline - now) / (1000 * 60 * 60);
        if (hoursRemaining <= 0) {
            deadlineWeight = 25; // Overdue or due immediately
        }
        else if (hoursRemaining <= 12) {
            deadlineWeight = 24; // Due today
        }
        else if (hoursRemaining <= 24) {
            deadlineWeight = 20; // Due within 24h
        }
        else if (hoursRemaining <= 72) {
            deadlineWeight = 14; // Due within 3 days
        }
        else {
            deadlineWeight = 8;
        }
        // 3. Business Impact (Max 20)
        let impactWeight = 10;
        if (task.business_impact === 'CRITICAL')
            impactWeight = 20;
        else if (task.business_impact === 'HIGH')
            impactWeight = 15;
        else if (task.business_impact === 'MEDIUM')
            impactWeight = 10;
        else if (task.business_impact === 'LOW')
            impactWeight = 5;
        // 4. Blocking Downstream Impact (Max 15)
        // If this task blocks 3 other tasks, it gets massive precedence!
        let blockingWeight = Math.min(blockingCount * 5, 15);
        // 5. Dependency Impact (-15 if waiting on another task, +5 if clear)
        let dependencyWeight = 5;
        if (hasUnresolvedUpstreamDependencies) {
            dependencyWeight = -15; // Should not start if blocked by uncompleted upstream task
        }
        // 6. Carry-Over Impact (Max 5)
        const carryoverWeight = task.is_carried_forward ? 5 : 0;
        // 7. Project Importance (Max 5)
        const projectWeight = 5;
        // Penalize tasks that are already completed or cancelled
        if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
            return {
                score: -100,
                weights: { managerWeight: 0, deadlineWeight: 0, impactWeight: 0, dependencyWeight: 0, blockingWeight: 0, carryoverWeight: 0, projectWeight: 0 },
            };
        }
        const totalScore = managerWeight +
            deadlineWeight +
            impactWeight +
            blockingWeight +
            dependencyWeight +
            carryoverWeight +
            projectWeight;
        return {
            score: Math.max(0, parseFloat(totalScore.toFixed(2))),
            weights: {
                managerWeight,
                deadlineWeight,
                impactWeight,
                dependencyWeight,
                blockingWeight,
                carryoverWeight,
                projectWeight,
            },
        };
    }
    /**
     * Recalculate priority order for all tasks assigned to an employee
     */
    async recalculateEmployeeTasks(employeeId) {
        try {
            // 1. Fetch employee's non-archived tasks
            const { data: rawTasks, error: taskError } = await supabase_1.supabase
                .from('tasks')
                .select(`
          *,
          project:projects(*),
          dependencies:task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id)
        `)
                .eq('assigned_to', employeeId)
                .neq('status', 'CANCELLED');
            if (taskError) {
                logger_1.logger.error('Error fetching tasks for priority engine:', taskError);
                throw taskError;
            }
            if (!rawTasks || rawTasks.length === 0) {
                return [];
            }
            // 2. Fetch all active manager overrides for this employee's tasks
            const taskIds = rawTasks.map((t) => t.id);
            const { data: overrides } = await supabase_1.supabase
                .from('manager_overrides')
                .select('*')
                .in('task_id', taskIds)
                .eq('active', true);
            const overrideMap = new Map();
            overrides?.forEach((ov) => overrideMap.set(ov.task_id, ov));
            // 3. Determine how many tasks each task is BLOCKING downstream
            const { data: allDownstreamDeps } = await supabase_1.supabase
                .from('task_dependencies')
                .select('task_id, depends_on_task_id')
                .in('depends_on_task_id', taskIds);
            const blockingCountMap = new Map();
            allDownstreamDeps?.forEach((dep) => {
                const count = blockingCountMap.get(dep.depends_on_task_id) || 0;
                blockingCountMap.set(dep.depends_on_task_id, count + 1);
            });
            // 4. Calculate scores for each task
            const scored = [];
            for (const t of rawTasks) {
                const blockingCount = blockingCountMap.get(t.id) || 0;
                const hasUnresolvedUpstream = t.status === 'BLOCKED';
                const { score, weights } = this.calculateDeterministicScore(t, blockingCount, hasUnresolvedUpstream);
                const override = overrideMap.get(t.id);
                const explanation = await priorityExplanation_service_1.priorityExplanationService.explainNextBestAction(t, blockingCount);
                scored.push({
                    task: {
                        ...t,
                        blocking_count: blockingCount,
                    },
                    priorityScore: override ? 999 - override.new_rank : score,
                    rank: override ? override.new_rank : 999,
                    weights,
                    reasonSummary: explanation.summary,
                    factors: explanation.factors,
                    isManagerOverridden: !!override,
                    overrideReason: override?.reason,
                });
            }
            // 5. Sort: Overrides pinned to top first, then descending by priorityScore
            scored.sort((a, b) => {
                if (a.isManagerOverridden && !b.isManagerOverridden)
                    return -1;
                if (!a.isManagerOverridden && b.isManagerOverridden)
                    return 1;
                if (a.isManagerOverridden && b.isManagerOverridden)
                    return a.rank - b.rank;
                return b.priorityScore - a.priorityScore;
            });
            // 6. Assign final sequential ranks 1, 2, 3...
            scored.forEach((item, index) => {
                item.rank = index + 1;
            });
            // 7. Persist ranks and scores to database in bulk/parallel
            await Promise.all(scored.map(async (st) => {
                await supabase_1.supabase
                    .from('tasks')
                    .update({
                    current_rank: st.rank,
                    priority_score: st.priorityScore,
                    recommendation_reason: st.reasonSummary,
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', st.task.id);
                await supabase_1.supabase.from('task_priority_scores').insert({
                    task_id: st.task.id,
                    employee_id: employeeId,
                    score: st.priorityScore,
                    manager_weight: st.weights.managerWeight,
                    deadline_weight: st.weights.deadlineWeight,
                    impact_weight: st.weights.impactWeight,
                    dependency_weight: st.weights.dependencyWeight,
                    blocking_weight: st.weights.blockingWeight,
                    carryover_weight: st.weights.carryoverWeight,
                    project_weight: st.weights.projectWeight,
                });
                await supabase_1.supabase.from('priority_recommendations').insert({
                    task_id: st.task.id,
                    employee_id: employeeId,
                    rank: st.rank,
                    priority_score: st.priorityScore,
                    reason_summary: st.reasonSummary,
                    factors: st.factors,
                    is_active: true,
                });
            }));
            return scored;
        }
        catch (err) {
            logger_1.logger.error('Failed to recalculate employee tasks:', err.message);
            throw err;
        }
    }
}
exports.PriorityEngineService = PriorityEngineService;
exports.priorityEngineService = new PriorityEngineService();
