import { Router } from 'express';
import { getRevenueReport, getAppointmentsReport, getInventoryReport, getExpensesReport, exportReportPDF } from '../controllers/reports.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
// Restrict reports to Admins
router.use(requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']));

router.get('/revenue', getRevenueReport);
router.get('/appointments', getAppointmentsReport);
router.get('/inventory', getInventoryReport);
router.get('/expenses', getExpensesReport);
router.get('/:type/export', exportReportPDF);

export default router;
