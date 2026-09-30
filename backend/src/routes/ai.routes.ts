import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/prioritize', aiController.prioritize);
router.post('/explain', aiController.explain);
router.post('/insights', aiController.askAssistant);

export default router;
