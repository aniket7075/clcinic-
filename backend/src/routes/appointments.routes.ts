import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, getTodayQueue, getAppointmentsByMonth } from '../controllers/appointments.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

import { requireRole } from '../middleware/auth.middleware';

// Apply auth middleware to all appointment routes
router.use(authenticateToken);

const writeRoles = ['CLINIC_ADMIN', 'RECEPTIONIST', 'DOCTOR'];

router.get('/queue', getTodayQueue);
router.get('/month/:year/:month', getAppointmentsByMonth);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', requireRole(writeRoles), createAppointment);
router.put('/:id', requireRole(writeRoles), updateAppointment);

export default router;
