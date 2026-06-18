import { Router } from 'express';
import { getWhatsAppStatus, logoutWhatsApp } from '../controllers/whatsapp.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// These routes require the user to be authenticated as clinic admin or doctor
router.use(authenticateToken);

router.get('/status', authenticateToken, getWhatsAppStatus);
router.post('/logout', authenticateToken, logoutWhatsApp);

export default router;
