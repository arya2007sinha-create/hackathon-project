import { z } from 'zod';

export const updateTaskStatusSchema = z.object({
  status: z.enum([
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'BLOCKED',
    'NEEDS_HELP',
    'OVERDUE',
    'CANCELLED',
  ]),
  reason: z.string().optional(),
});

export const blockTaskSchema = z.object({
  blockedCategory: z.enum([
    'Waiting for another person',
    'Waiting for information',
    'Technical issue',
    'Requirement unclear',
    'External dependency',
    'Too complex',
    'Other',
  ]),
  blockedReason: z.string().min(3, 'Please describe what is blocking this task'),
  requestSupport: z.boolean().optional().default(true),
});

export const requestHelpSchema = z.object({
  details: z.string().min(5, 'Please provide details on where you need assistance'),
});

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  teamId: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  businessImpact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  estimatedMinutes: z.number().int().positive().default(60),
  dependencies: z.array(z.string().uuid()).optional(),
});

export const managerOverrideSchema = z.object({
  newRank: z.number().int().positive().max(100),
  reason: z.string().min(5, 'A clear reason for the priority override is required'),
});
