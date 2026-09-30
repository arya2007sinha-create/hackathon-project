import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticateJwt, authController.logout);
router.get('/me', authenticateJwt, authController.getMe);

export default router;
