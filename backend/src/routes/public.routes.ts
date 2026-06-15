import { Router } from 'express';
import { getClinicBookingInfo, submitPublicAppointment } from '../controllers/public.controller';

const router = Router();

// These routes do NOT use authenticateToken middleware
router.get('/booking/:clinicId', getClinicBookingInfo);
router.post('/booking/:clinicId', submitPublicAppointment);

export default router;
