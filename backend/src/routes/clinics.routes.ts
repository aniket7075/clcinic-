import { Router } from 'express';
import { getClinics, createClinic, updateClinic, deleteClinic, getClinicRequests, approveClinicRequest, rejectClinicRequest, updateClinicFeatures } from '../controllers/clinics.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All clinic management endpoints require authentication and SUPER_ADMIN role
router.use(authenticateToken);
router.use(requireRole(['SUPER_ADMIN']));

// Clinic Requests (SaaS Registration)
router.get('/requests', getClinicRequests);
router.post('/requests/:id/approve', approveClinicRequest);
router.post('/requests/:id/reject', rejectClinicRequest);

router.get('/', getClinics);
router.post('/', createClinic);
router.put('/:id', updateClinic);
router.patch('/:id/features', updateClinicFeatures);
router.delete('/:id', deleteClinic);

export default router;
