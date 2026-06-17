import { Router } from 'express';
import { getClinicBookingInfo, submitPublicAppointment, registerClinicRequest, activateClinic } from '../controllers/public.controller';

const router = Router();

// These routes do NOT use authenticateToken middleware
router.get('/booking/:clinicId', getClinicBookingInfo);
router.post('/booking/:clinicId', submitPublicAppointment);
router.post('/register-clinic', registerClinicRequest);
router.post('/activate-clinic', activateClinic);

export default router;
