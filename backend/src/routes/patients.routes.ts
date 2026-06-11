import { Router } from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, searchPatients, getPatientTimeline } from '../controllers/patients.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all patient routes
router.use(authenticateToken);

// Allow access to multiple roles
const patientAccessRoles = ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'];

router.get('/search', requireRole(patientAccessRoles), searchPatients);
router.get('/', requireRole(patientAccessRoles), getPatients);
router.get('/:id', requireRole(patientAccessRoles), getPatientById);
router.get('/:id/timeline', requireRole(patientAccessRoles), getPatientTimeline);
router.post('/', requireRole(patientAccessRoles), createPatient);
router.put('/:id', requireRole(patientAccessRoles), updatePatient);

export default router;
