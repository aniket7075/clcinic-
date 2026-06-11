import { Router } from 'express';
import { 
  getInvoices, getInvoiceById, createInvoice, 
  addPayment, generateInvoicePDF 
} from '../controllers/billing.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

import { requireRole } from '../middleware/auth.middleware';

router.use(authenticateToken);

const billingRoles = ['CLINIC_ADMIN', 'RECEPTIONIST', 'DOCTOR'];

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', requireRole(billingRoles), createInvoice);
router.post('/:id/payments', requireRole(billingRoles), addPayment);
router.get('/:id/pdf', generateInvoicePDF);

export default router;
