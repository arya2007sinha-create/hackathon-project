import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import managementRoutes from './management.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employee', employeeRoutes);
router.use('/management', managementRoutes);
router.use('/ai', aiRoutes);

export default router;
