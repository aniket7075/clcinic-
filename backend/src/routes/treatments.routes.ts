import { Router } from 'express';
import { 
  getMedicalHistory, addMedicalRecord, 
  getDentalChart, updateToothStatus, 
  getPrescriptions, createPrescription,
  exportPrescriptionPDF 
} from '../controllers/treatments.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Medical History
router.get('/:patientId/history', getMedicalHistory);
router.post('/history', requireRole(['DOCTOR']), addMedicalRecord);

// Dental Chart
router.get('/:patientId/chart', getDentalChart);
router.put('/:patientId/chart/:toothNumber', requireRole(['DOCTOR']), updateToothStatus);

// Prescriptions
router.get('/:patientId/prescriptions', getPrescriptions);
router.post('/prescriptions', requireRole(['DOCTOR']), createPrescription);
router.get('/prescriptions/:prescriptionId/pdf', exportPrescriptionPDF);

export default router;
