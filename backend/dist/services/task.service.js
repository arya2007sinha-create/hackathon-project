"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = exports.TaskService = void 0;
const supabase_1 = require("../config/supabase");
const priorityEngine_service_1 = require("./priorityEngine.service");
const adherence_service_1 = require("./adherence.service");
const teamHealth_service_1 = require("./teamHealth.service");
const logger_1 = require("../utils/logger");
class TaskService {
    /**
     * Update task status (Start, Pause, Complete, etc.)
     */
    async updateTaskStatus(taskId, newStatus, userId, reason) {
        try {
            // 1. Fetch current task
            const { data: currentTask, error: fetchErr } = await supabase_1.supabase
                .from('tasks')
                .select('*')
                .eq('id', taskId)
                .single();
            if (fetchErr || !currentTask) {
                throw new Error(`Task ${taskId} not found`);
            }
            const prevStatus = currentTask.status;
            const updates = {
                status: newStatus,
                updated_at: new Date().toISOString(),
            };
            if (newStatus === 'IN_PROGRESS' && !currentTask.started_at) {
                updates.started_at = new Date().toISOString();
            }
            if (newStatus === 'COMPLETED') {
                updates.completed_at = new Date().toISOString();
            }
            // 2. Perform DB update
            const { data: updatedTask, error: updateErr } = await supabase_1.supabase
                .from('tasks')
                .update(updates)
                .eq('id', taskId)
                .select()
                .single();
            if (updateErr)
                throw updateErr;
            // 3. Record status history
            await supabase_1.supabase.from('task_status_history').insert({
                task_id: taskId,
                previous_status: prevStatus,
                new_status: newStatus,
                changed_by: userId,
                reason: reason || `Status changed from ${prevStatus} to ${newStatus}`,
            });
            // 4. Record execution event
            const eventType = newStatus === 'IN_PROGRESS'
                ? 'TASK_STARTED'
                : newStatus === 'COMPLETED'
                    ? 'TASK_COMPLETED'
                    : newStatus === 'BLOCKED'
                        ? 'TASK_BLOCKED'
                        : 'STATUS_CHANGED';
            await supabase_1.supabase.from('task_execution_events').insert({
                task_id: taskId,
                user_id: userId,
                event_type: eventType,
                metadata: { prevStatus, newStatus, reason },
            });
            // 5. If started, check priority adherence
            if (newStatus === 'IN_PROGRESS' && currentTask.assigned_to) {
                await adherence_service_1.adherenceService.checkTaskStartAdherence(currentTask.assigned_to, taskId);
            }
            // 6. If completed or blocked, trigger dynamic reprioritization
            if (currentTask.assigned_to) {
                await priorityEngine_service_1.priorityEngineService.recalculateEmployeeTasks(currentTask.assigned_to);
            }
            // 7. Update team health
            if (currentTask.team_id) {
                await teamHealth_service_1.teamHealthService.evaluateTeamHealth(currentTask.team_id);
            }
            return updatedTask;
        }
        catch (err) {
            logger_1.logger.error('Error updating task status:', err.message);
            throw err;
        }
    }
    /**
     * Block Task Workflow: sets task to BLOCKED, sets user to NEEDS_ATTENTION (orange), creates support request and manager alert
     */
    async blockTask(taskId, userId, data) {
        try {
            const { data: task, error: fetchErr } = await supabase_1.supabase
                .from('tasks')
                .select('*, assigned_user:users(*)')
                .eq('id', taskId)
                .single();
            if (fetchErr || !task)
                throw new Error('Task not found');
            // 1. Update task to BLOCKED
            const { data: updatedTask, error: updateErr } = await supabase_1.supabase
                .from('tasks')
                .update({
                status: 'BLOCKED',
                blocked_category: data.blockedCategory,
                blocked_reason: data.blockedReason,
                updated_at: new Date().toISOString(),
            })
                .eq('id', taskId)
                .select()
                .single();
            if (updateErr)
                throw updateErr;
            // 2. Set employee attention status to NEEDS_ATTENTION (🟠 Orange signal)
            if (task.assigned_to) {
                await supabase_1.supabase
                    .from('users')
                    .update({
                    attention_status: 'NEEDS_ATTENTION',
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', task.assigned_to);
            }
            // 3. Create Support Request
            await supabase_1.supabase.from('support_requests').insert({
                task_id: taskId,
                employee_id: userId,
                reason: data.blockedCategory,
                details: data.blockedReason,
                status: 'PENDING',
            });
            // 4. Log execution event
            await supabase_1.supabase.from('task_execution_events').insert({
                task_id: taskId,
                user_id: userId,
                event_type: 'TASK_BLOCKED',
                metadata: {
                    category: data.blockedCategory,
                    reason: data.blockedReason,
                },
            });
            // 5. Create Management Alert (Orange / Red)
            const severity = data.blockedCategory === 'External dependency' || task.priority === 'CRITICAL' ? 'RED' : 'ORANGE';
            await supabase_1.supabase.from('notifications').insert({
                user_id: userId,
                team_id: task.team_id,
                type: 'POTENTIAL_BLOCKER',
                severity,
                title: `Task Blocked: ${task.title}`,
                message: `${task.assigned_user?.name || 'Employee'} blocked on "${task.title}": ${data.blockedReason} (${data.blockedCategory})`,
                task_id: taskId,
                action_url: `/management/tasks?id=${taskId}`,
            });
            // 6. Dynamic reprioritization
            if (task.assigned_to) {
                await priorityEngine_service_1.priorityEngineService.recalculateEmployeeTasks(task.assigned_to);
            }
            // 7. Update team health
            await teamHealth_service_1.teamHealthService.evaluateTeamHealth(task.team_id);
            return updatedTask;
        }
        catch (err) {
            logger_1.logger.error('Error blocking task:', err.message);
            throw err;
        }
    }
    /**
     * Manager manual override of task ranking
     */
    async createManagerOverride(taskId, managerId, newRank, reason) {
        try {
            const { data: task, error: fetchErr } = await supabase_1.supabase
                .from('tasks')
                .select('*')
                .eq('id', taskId)
                .single();
            if (fetchErr || !task)
                throw new Error('Task not found');
            const prevRank = task.current_rank || 999;
            // 1. Deactivate existing overrides for this task
            await supabase_1.supabase
                .from('manager_overrides')
                .update({ active: false })
                .eq('task_id', taskId);
            // 2. Insert new active override
            const { data: override, error: overrideErr } = await supabase_1.supabase
                .from('manager_overrides')
                .insert({
                task_id: taskId,
                manager_id: managerId,
                previous_rank: prevRank,
                new_rank: newRank,
                reason,
                active: true,
            })
                .select()
                .single();
            if (overrideErr)
                throw overrideErr;
            // 3. Log execution event
            await supabase_1.supabase.from('task_execution_events').insert({
                task_id: taskId,
                user_id: managerId,
                event_type: 'MANAGER_OVERRIDE',
                metadata: {
                    previousRank: prevRank,
                    newRank,
                    reason,
                },
            });
            // 4. Create Notification
            await supabase_1.supabase.from('notifications').insert({
                user_id: task.assigned_to,
                team_id: task.team_id,
                type: 'MANAGER_OVERRIDE',
                severity: 'BLUE',
                title: 'Manager Priority Override Applied',
                message: `Task "${task.title}" manual ranking updated to #${newRank} by management. Reason: ${reason}`,
                task_id: taskId,
            });
            // 5. Trigger dynamic reprioritization
            if (task.assigned_to) {
                await priorityEngine_service_1.priorityEngineService.recalculateEmployeeTasks(task.assigned_to);
            }
            return override;
        }
        catch (err) {
            logger_1.logger.error('Error creating manager override:', err.message);
            throw err;
        }
    }
    /**
     * Create a new task (Manager)
     */
    async createTask(createdBy, data) {
        try {
            const taskCode = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
            // 1. Insert task
            const { data: task, error: insertErr } = await supabase_1.supabase
                .from('tasks')
                .insert({
                task_code: taskCode,
                title: data.title,
                description: data.description,
                project_id: data.projectId || null,
                team_id: data.teamId,
                assigned_to: data.assignedTo || null,
                created_by: createdBy,
                priority: data.priority,
                business_impact: data.businessImpact,
                deadline: data.deadline,
                estimated_minutes: data.estimatedMinutes,
                status: 'NOT_STARTED',
            })
                .select()
                .single();
            if (insertErr || !task)
                throw insertErr;
            // 2. Add dependencies if provided
            if (data.dependencies && data.dependencies.length > 0) {
                const depInserts = data.dependencies.map((depId) => ({
                    task_id: task.id,
                    depends_on_task_id: depId,
                }));
                await supabase_1.supabase.from('task_dependencies').insert(depInserts);
            }
            // 3. Log execution event
            await supabase_1.supabase.from('task_execution_events').insert({
                task_id: task.id,
                user_id: createdBy,
                event_type: 'TASK_CREATED',
                metadata: { title: data.title, priority: data.priority },
            });
            // 4. Trigger automatic priority recalculation
            if (data.assignedTo) {
                await priorityEngine_service_1.priorityEngineService.recalculateEmployeeTasks(data.assignedTo);
            }
            // 5. Update team health
            await teamHealth_service_1.teamHealthService.evaluateTeamHealth(data.teamId);
            return task;
        }
        catch (err) {
            logger_1.logger.error('Error creating task:', err.message);
            throw err;
        }
    }
}
exports.TaskService = TaskService;
exports.taskService = new TaskService();
