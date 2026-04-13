/* backend/routes/reportRoutes.js */
import express from 'express';
import { incomeByCategory, expenseByCategory, invoicesSummary, financialOverview } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/income-by-category', checkPermission('Reports', 'Read'), incomeByCategory);
router.get('/expense-by-category', checkPermission('Reports', 'Read'), expenseByCategory);
router.get('/invoices-summary', checkPermission('Reports', 'Read'), invoicesSummary);
router.get('/financial-overview', checkPermission('Reports', 'Read'), financialOverview);

export default router;
