import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  updateTaskStatusSchema,
  blockTaskSchema,
  requestHelpSchema,
} from '../validators/task.validator';

const router = Router();

// Protect all employee routes with JWT authentication
router.use(authenticateJwt);

router.get('/dashboard', employeeController.getDashboard);
router.get('/tasks', employeeController.getTasks);
router.get('/tasks/:id', employeeController.getTaskById);
router.patch('/tasks/:id/status', validate(updateTaskStatusSchema), employeeController.updateTaskStatus);
router.post('/tasks/:id/block', validate(blockTaskSchema), employeeController.blockTask);
router.post('/tasks/:id/help', validate(requestHelpSchema), employeeController.requestHelp);
router.post('/tasks/:id/suggest-priority', employeeController.recalculatePriorities);
router.get('/recommendations', employeeController.recalculatePriorities);
router.get('/progress', employeeController.getDashboard);

export default router;
