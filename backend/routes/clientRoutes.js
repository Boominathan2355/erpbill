/* backend/routes/clientRoutes.js */
import express from 'express';
import { getAll, create, getById, update, deleteClient } from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';
import { auditLogger } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Clients', 'Read'), getAll);
router.post('/', checkPermission('Clients', 'Full'), auditLogger('Clients'), create);
router.get('/:id', checkPermission('Clients', 'Read'), getById);
router.put('/:id', checkPermission('Clients', 'Full'), auditLogger('Clients'), update);
router.delete('/:id', checkPermission('Clients', 'Full'), auditLogger('Clients'), deleteClient);

export default router;
