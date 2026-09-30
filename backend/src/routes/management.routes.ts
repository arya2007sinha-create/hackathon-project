import { Router } from 'express';
import { managementController } from '../controllers/management.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTaskSchema,
  managerOverrideSchema,
} from '../validators/task.validator';

const router = Router();

// Require JWT and Manager/Admin role
router.use(authenticateJwt);
router.use(requireRoles(['manager', 'admin']));

router.get('/dashboard', managementController.getDashboard);
router.get('/teams', managementController.getTeams);
router.get('/teams/:id', managementController.getTeamById);
router.get('/employees', managementController.getEmployees);
router.get('/employees/:id', managementController.getEmployeeById);
router.get('/tasks', managementController.getTasks);
router.post('/tasks', validate(createTaskSchema), managementController.createTask);
router.post('/tasks/:id/override', validate(managerOverrideSchema), managementController.createOverride);
router.get('/alerts', managementController.getAlerts);
router.get('/analytics', managementController.getAnalytics);

export default router;
