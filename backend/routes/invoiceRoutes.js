/* backend/routes/invoiceRoutes.js */
import express from 'express';
import { getAll, create, getNextNumber, getById, update, updateStatus, deleteInvoice } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';
import { auditLogger } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Invoices', 'Read'), getAll);
router.post('/', checkPermission('Invoices', 'Full'), auditLogger('Invoices'), create);
router.get('/next-number', checkPermission('Invoices', 'Read'), getNextNumber);
router.get('/:id', checkPermission('Invoices', 'Read'), getById);
router.put('/:id', checkPermission('Invoices', 'Full'), auditLogger('Invoices'), update);
router.patch('/:id/status', checkPermission('Invoices', 'Full'), auditLogger('Invoices'), updateStatus);
router.delete('/:id', checkPermission('Invoices', 'Full'), auditLogger('Invoices'), deleteInvoice);

export default router;
