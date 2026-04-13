/* backend/routes/transactionRoutes.js */
import express from 'express';
import { getAll, create, getById, update, deleteTransaction } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';
import { auditLogger } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Finance', 'Read'), getAll);
router.post('/', checkPermission('Finance', 'Full'), auditLogger('Finance'), create);
router.get('/:id', checkPermission('Finance', 'Read'), getById);
router.put('/:id', checkPermission('Finance', 'Full'), auditLogger('Finance'), update);
router.delete('/:id', checkPermission('Finance', 'Full'), auditLogger('Finance'), deleteTransaction);

export default router;
