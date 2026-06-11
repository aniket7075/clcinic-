import { Router } from 'express';
import { getClinics, createClinic, updateClinic, deleteClinic } from '../controllers/clinics.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All clinic management endpoints require authentication and SUPER_ADMIN role
router.use(authenticateToken);
router.use(requireRole(['SUPER_ADMIN']));

router.get('/', getClinics);
router.post('/', createClinic);
router.put('/:id', updateClinic);
router.delete('/:id', deleteClinic);

export default router;
