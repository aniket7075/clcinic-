import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
