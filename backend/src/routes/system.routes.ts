import { Router } from 'express';
import { getSystemSettings, updateSystemSetting } from '../controllers/system.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
// Only System Admins can manage these settings
router.use(requireRole(['SUPER_ADMIN']));

router.get('/settings', getSystemSettings);
router.put('/settings/:key', updateSystemSetting);

export default router;
