import { Router } from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenses.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
