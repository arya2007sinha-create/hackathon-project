"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerOverrideSchema = exports.createTaskSchema = exports.requestHelpSchema = exports.blockTaskSchema = exports.updateTaskStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateTaskStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'NOT_STARTED',
        'IN_PROGRESS',
        'COMPLETED',
        'BLOCKED',
        'NEEDS_HELP',
        'OVERDUE',
        'CANCELLED',
    ]),
    reason: zod_1.z.string().optional(),
});
exports.blockTaskSchema = zod_1.z.object({
    blockedCategory: zod_1.z.enum([
        'Waiting for another person',
        'Waiting for information',
        'Technical issue',
        'Requirement unclear',
        'External dependency',
        'Too complex',
        'Other',
    ]),
    blockedReason: zod_1.z.string().min(3, 'Please describe what is blocking this task'),
    requestSupport: zod_1.z.boolean().optional().default(true),
});
exports.requestHelpSchema = zod_1.z.object({
    details: zod_1.z.string().min(5, 'Please provide details on where you need assistance'),
});
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title is required'),
    description: zod_1.z.string().optional(),
    projectId: zod_1.z.string().uuid().optional(),
    teamId: zod_1.z.string().uuid(),
    assignedTo: zod_1.z.string().uuid().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    businessImpact: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    deadline: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    estimatedMinutes: zod_1.z.number().int().positive().default(60),
    dependencies: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
exports.managerOverrideSchema = zod_1.z.object({
    newRank: zod_1.z.number().int().positive().max(100),
    reason: zod_1.z.string().min(5, 'A clear reason for the priority override is required'),
});
