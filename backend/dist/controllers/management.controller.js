"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managementController = exports.ManagementController = void 0;
const supabase_1 = require("../config/supabase");
const teamHealth_service_1 = require("../services/teamHealth.service");
const adherence_service_1 = require("../services/adherence.service");
const task_service_1 = require("../services/task.service");
const response_1 = require("../utils/response");
class ManagementController {
    async getDashboard(req, res) {
        try {
            // 1. Evaluate team health reports for all 5 teams
            const teamHealthReports = await teamHealth_service_1.teamHealthService.evaluateAllTeams();
            // 2. Fetch all employees with their metrics
            const { data: employees } = await supabase_1.supabase
                .from('users')
                .select('*, team:teams!users_team_id_fkey(name)')
                .eq('is_active', true)
                .order('name');
            // Fetch task stats per employee
            const { data: allTasks } = await supabase_1.supabase
                .from('tasks')
                .select('id, assigned_to, status, priority, business_impact, deadline, current_rank, title');
            const tasksByEmp = new Map();
            allTasks?.forEach((t) => {
                if (t.assigned_to) {
                    const list = tasksByEmp.get(t.assigned_to) || [];
                    list.push(t);
                    tasksByEmp.set(t.assigned_to, list);
                }
            });
            // Fetch all execution events once for rapid in-memory adherence calculation
            const { data: allEvents } = await supabase_1.supabase
                .from('task_execution_events')
                .select('user_id, event_type');
            const eventsByUser = new Map();
            allEvents?.forEach((ev) => {
                if (ev.user_id) {
                    const list = eventsByUser.get(ev.user_id) || [];
                    list.push(ev);
                    eventsByUser.set(ev.user_id, list);
                }
            });
            // Assemble Employee Grid with adherence
            const employeeGrid = (employees || []).map((emp) => {
                const empTasks = tasksByEmp.get(emp.id) || [];
                const active = empTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
                const completed = empTasks.filter((t) => t.status === 'COMPLETED').length;
                const blocked = empTasks.filter((t) => t.status === 'BLOCKED').length;
                const total = empTasks.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                const empEvents = eventsByUser.get(emp.id) || [];
                const starts = empEvents.filter((e) => e.event_type === 'TASK_STARTED').length;
                const deviations = empEvents.filter((e) => e.event_type === 'PRIORITY_DEVIATION').length;
                const adherence = starts > 0 ? Math.max(40, Math.min(100, Math.round(((starts - deviations) / starts) * 100))) : 94;
                return {
                    id: emp.id,
                    name: emp.name,
                    email: emp.email,
                    jobTitle: emp.job_title,
                    teamName: emp.team?.name || 'Unassigned',
                    progress,
                    activeTasks: active,
                    blockedTasks: blocked,
                    priorityAdherence: adherence,
                    attentionStatus: emp.attention_status || (blocked > 0 ? 'NEEDS_ATTENTION' : 'HEALTHY'),
                };
            });
            // 3. Operational Overview Top Metrics
            const totalEmployees = employees?.length || 0;
            const activeTasksCount = allTasks?.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length || 0;
            const completedTodayCount = allTasks?.filter((t) => t.status === 'COMPLETED').length || 0;
            const blockedCount = allTasks?.filter((t) => t.status === 'BLOCKED').length || 0;
            const now = new Date();
            const overdueCount = allTasks?.filter((t) => t.status !== 'COMPLETED' && new Date(t.deadline).getTime() < now.getTime()).length || 0;
            // 4. Attention Center alerts
            const { data: alerts } = await supabase_1.supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(8);
            const attentionSignalsCount = (alerts?.filter((a) => !a.read).length || 0) + (blockedCount > 0 ? 1 : 0);
            // 5. Early Warning System (Operations Team spotlight)
            const opsTeam = teamHealthReports.find((r) => r.team.name.toLowerCase().includes('operations'));
            const earlyWarning = {
                teamName: 'Operations',
                status: opsTeam?.healthStatus || 'NEEDS_ATTENTION',
                expectedProgress: opsTeam?.expectedProgress || 82,
                currentProgress: opsTeam?.actualProgress || 68,
                delta: opsTeam?.delta || 14,
                contributingSignals: [
                    '3 delayed tasks exceeding estimation thresholds',
                    '1 blocked employee (Rahul Sharma - Payment Gateway Integration)',
                    '2 unresolved upstream vendor dependencies',
                    '1 critical deadline risk on Checkout Service release',
                ],
                suggestedInvestigationArea: 'Resolve Payment API Integration',
                investigationTaskId: allTasks?.find((t) => t.title.toLowerCase().includes('payment'))?.id,
            };
            // 6. Priority Adherence Spotlight
            const priorityAdherenceAlert = {
                title: 'Priority Deviation Detected',
                employee: 'Aman Verma',
                team: 'Data & AI',
                recommended: 'Task #2 (Data Pipeline Validation)',
                actual: 'Task #3 (Feature Store Optimization)',
                elapsedMinutes: 48,
                status: 'NEEDS_ATTENTION',
                contextualNotes: 'Employee manually engaged Task #3 before prerequisite Task #2 completed.',
            };
            // 7. Recent Events feed
            const { data: recentEvents } = await supabase_1.supabase
                .from('task_execution_events')
                .select('*, tasks(title), users(name)')
                .order('created_at', { ascending: false })
                .limit(10);
            return (0, response_1.sendSuccess)(res, {
                metrics: {
                    totalEmployees,
                    activeTasks: activeTasksCount,
                    completedToday: completedTodayCount,
                    blocked: blockedCount,
                    overdue: overdueCount,
                    attentionSignals: attentionSignalsCount,
                },
                teamHealth: teamHealthReports.map((r) => ({
                    id: r.team.id,
                    name: r.team.name,
                    code: r.team.code,
                    healthStatus: r.healthStatus,
                    expectedProgress: r.expectedProgress,
                    actualProgress: r.actualProgress,
                    delta: r.delta,
                    activeTasks: r.activeTasks,
                    completedTasks: r.completedTasks,
                    blockedTasks: r.blockedTasks,
                    signals: r.signals,
                    suggestedAction: r.suggestedAction,
                })),
                attentionCenter: alerts || [],
                earlyWarning,
                priorityAdherenceSpotlight: priorityAdherenceAlert,
                employeeGrid,
                recentEvents: (recentEvents || []).map((ev) => ({
                    id: ev.id,
                    type: ev.event_type,
                    taskTitle: ev.tasks?.title || 'Unknown Task',
                    userName: ev.users?.name || 'System',
                    metadata: ev.metadata,
                    createdAt: ev.created_at,
                })),
            }, 'Management dashboard retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'MANAGEMENT_DASHBOARD_ERROR', 500);
        }
    }
    async getTeams(req, res) {
        try {
            const reports = await teamHealth_service_1.teamHealthService.evaluateAllTeams();
            return (0, response_1.sendSuccess)(res, reports, 'Teams retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'TEAMS_ERROR', 500);
        }
    }
    async getTeamById(req, res) {
        try {
            const id = req.params.id;
            const report = await teamHealth_service_1.teamHealthService.evaluateTeamHealth(id);
            const { data: members } = await supabase_1.supabase
                .from('users')
                .select('*')
                .eq('team_id', id);
            const { data: projects } = await supabase_1.supabase
                .from('projects')
                .select('*')
                .eq('team_id', id);
            const { data: tasks } = await supabase_1.supabase
                .from('tasks')
                .select('*, assigned_user:users(*)')
                .eq('team_id', id)
                .order('current_rank');
            return (0, response_1.sendSuccess)(res, {
                report,
                members: members || [],
                projects: projects || [],
                tasks: tasks || [],
            }, 'Team detail retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'TEAM_DETAIL_ERROR', 500);
        }
    }
    async getEmployees(req, res) {
        try {
            const { data: employees, error } = await supabase_1.supabase
                .from('users')
                .select('*, team:teams!users_team_id_fkey(*)')
                .order('name');
            if (error)
                throw error;
            const safeEmployees = employees.map(({ password_hash, ...u }) => u);
            return (0, response_1.sendSuccess)(res, safeEmployees, 'Employees retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'EMPLOYEES_ERROR', 500);
        }
    }
    async getEmployeeById(req, res) {
        try {
            const id = req.params.id;
            const { data: employee, error } = await supabase_1.supabase
                .from('users')
                .select('*, team:teams!users_team_id_fkey(*)')
                .eq('id', id)
                .single();
            if (error || !employee) {
                return (0, response_1.sendError)(res, 'Employee not found', 'NOT_FOUND', 404);
            }
            const { data: tasks } = await supabase_1.supabase
                .from('tasks')
                .select('*, project:projects(*)')
                .eq('assigned_to', id)
                .order('current_rank');
            const { data: recentEvents } = await supabase_1.supabase
                .from('task_execution_events')
                .select('*')
                .eq('user_id', id)
                .order('created_at', { ascending: false })
                .limit(10);
            const adherence = await adherence_service_1.adherenceService.calculateEmployeeAdherence(id);
            const { password_hash, ...safeEmployee } = employee;
            return (0, response_1.sendSuccess)(res, {
                employee: safeEmployee,
                tasks: tasks || [],
                recentEvents: recentEvents || [],
                priorityAdherence: adherence,
            }, 'Employee details retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'EMPLOYEE_DETAIL_ERROR', 500);
        }
    }
    async getTasks(req, res) {
        try {
            const { teamId, employeeId, status, search } = req.query;
            let query = supabase_1.supabase
                .from('tasks')
                .select('*, project:projects(*), assigned_user:users(id, name, avatar_url), team:teams(id, name)')
                .order('current_rank', { ascending: true });
            if (teamId)
                query = query.eq('team_id', teamId);
            if (employeeId)
                query = query.eq('assigned_to', employeeId);
            if (status)
                query = query.eq('status', status);
            if (search)
                query = query.ilike('title', `%${search}%`);
            const { data: tasks, error } = await query;
            if (error)
                throw error;
            return (0, response_1.sendSuccess)(res, tasks, 'Tasks retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'TASKS_ERROR', 500);
        }
    }
    async createTask(req, res) {
        try {
            const managerId = req.user?.userId;
            const created = await task_service_1.taskService.createTask(managerId, req.body);
            return (0, response_1.sendSuccess)(res, created, 'Task created and prioritized successfully', 201);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'TASK_CREATION_ERROR', 500);
        }
    }
    async createOverride(req, res) {
        try {
            const id = req.params.id;
            const { newRank, reason } = req.body;
            const managerId = req.user?.userId;
            const override = await task_service_1.taskService.createManagerOverride(id, managerId, newRank, reason);
            return (0, response_1.sendSuccess)(res, override, `Task manual priority overridden to rank #${newRank}`);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'OVERRIDE_ERROR', 500);
        }
    }
    async getAlerts(req, res) {
        try {
            const { data: alerts, error } = await supabase_1.supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            if (error)
                throw error;
            return (0, response_1.sendSuccess)(res, alerts, 'Alerts retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'ALERTS_ERROR', 500);
        }
    }
    async getAnalytics(req, res) {
        try {
            const { timeRange = '7D' } = req.query;
            // Realistic historical trends for Northstar Technologies
            const completionVelocity = [
                { day: 'Mon', completed: 18, planned: 20 },
                { day: 'Tue', completed: 24, planned: 22 },
                { day: 'Wed', completed: 21, planned: 25 },
                { day: 'Thu', completed: 28, planned: 26 },
                { day: 'Fri', completed: 32, planned: 30 },
                { day: 'Sat', completed: 14, planned: 12 },
                { day: 'Sun', completed: 11, planned: 10 },
            ];
            const adherenceTrend = [
                { date: 'Sep 24', adherence: 88 },
                { date: 'Sep 25', adherence: 91 },
                { date: 'Sep 26', adherence: 86 },
                { date: 'Sep 27', adherence: 94 },
                { date: 'Sep 28', adherence: 89 },
                { date: 'Sep 29', adherence: 92 },
                { date: 'Sep 30', adherence: 90 },
            ];
            const workloadDistribution = [
                { team: 'Engineering', tasks: 32, capacity: 40 },
                { team: 'Data & AI', tasks: 26, capacity: 30 },
                { team: 'Operations', tasks: 38, capacity: 35 }, // overloaded
                { team: 'Design', tasks: 18, capacity: 25 },
                { team: 'Customer Success', tasks: 29, capacity: 28 },
            ];
            return (0, response_1.sendSuccess)(res, {
                timeRange,
                completionVelocity,
                adherenceTrend,
                workloadDistribution,
                summary: {
                    overallAdherenceRate: '90.2%',
                    averageResolutionHours: '3.4h',
                    activeBottlenecks: 3,
                }
            }, 'Analytics retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'ANALYTICS_ERROR', 500);
        }
    }
}
exports.ManagementController = ManagementController;
exports.managementController = new ManagementController();
