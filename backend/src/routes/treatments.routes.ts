import { Router } from 'express';
import { 
  getMedicalHistory, addMedicalRecord, 
  getDentalChart, updateToothStatus, 
  getPrescriptions, createPrescription,
  exportPrescriptionPDF,
  getTreatmentPlans, createTreatmentPlan, updateTreatmentPlanStage,
  getLabOrders, createLabOrder, updateLabOrder,
  getPatientDocuments, addPatientDocument, deletePatientDocument
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

// Treatment Plans
router.get('/:patientId/plans', getTreatmentPlans);
router.post('/plans', requireRole(['DOCTOR']), createTreatmentPlan);
router.put('/plans/stages/:stageId', requireRole(['DOCTOR']), updateTreatmentPlanStage);

// Lab Orders
router.get('/lab-orders', getLabOrders); // Using query param patientId optionally
router.post('/lab-orders', requireRole(['DOCTOR']), createLabOrder);
router.put('/lab-orders/:id', requireRole(['DOCTOR']), updateLabOrder);

// Patient Documents
router.get('/:patientId/documents', getPatientDocuments);
router.post('/documents', requireRole(['DOCTOR', 'STAFF']), addPatientDocument);
router.delete('/documents/:id', requireRole(['DOCTOR']), deletePatientDocument);

export default router;
