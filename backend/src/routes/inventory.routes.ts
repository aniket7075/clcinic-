import { Router } from 'express';
import { 
  getInventory, addItem, updateItem, getLowStockAlerts,
  getSuppliers, addSupplier, getPurchases, addPurchase
} from '../controllers/inventory.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

import { requireRole } from '../middleware/auth.middleware';

router.use(authenticateToken);

const invRoles = ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'ASSISTANT'];

router.get('/alerts', getLowStockAlerts);
router.get('/', getInventory);
router.post('/', requireRole(invRoles), addItem);
router.put('/:id', requireRole(invRoles), updateItem);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', requireRole(invRoles), addSupplier);

// Purchases
router.get('/purchases', getPurchases);
router.post('/purchases', requireRole(invRoles), addPurchase);

export default router;
