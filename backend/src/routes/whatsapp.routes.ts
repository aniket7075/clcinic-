import { Router } from 'express';
import { getWhatsAppStatus, logoutWhatsApp } from '../controllers/whatsapp.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// These routes require the user to be authenticated as clinic admin or doctor
router.use(requireAuth);

router.get('/status', getWhatsAppStatus);
router.post('/logout', logoutWhatsApp);

export default router;
