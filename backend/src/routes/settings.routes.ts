import { Router } from 'express';
import { getClinicSettings, updateClinicSettings, getNotificationTemplates, upsertNotificationTemplate, getAuditLogs, getClinics, upgradeSubscription } from '../controllers/settings.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Reading is open to authenticated users (e.g., to get clinic name for header)
router.get('/clinic', getClinicSettings);

router.get('/clinics', getClinics);

// Writing / Managing restricted to Admins
router.put('/clinic', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), updateClinicSettings);
router.post('/subscription/upgrade', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), upgradeSubscription);

router.get('/notifications', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), getNotificationTemplates);
router.post('/notifications', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), upsertNotificationTemplate);

router.get('/logs', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), getAuditLogs);

export default router;
