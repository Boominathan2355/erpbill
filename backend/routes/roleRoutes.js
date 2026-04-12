/* backend/routes/roleRoutes.js */
import express from 'express';
import { getAll, create, update, deleteRole } from '../controllers/roleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';
import { auditLogger } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Role Management', 'Read'), getAll);
router.post('/', checkPermission('Role Management', 'Full'), auditLogger('Role Management'), create);
router.put('/:id', checkPermission('Role Management', 'Full'), auditLogger('Role Management'), update);
router.delete('/:id', checkPermission('Role Management', 'Full'), auditLogger('Role Management'), deleteRole);

export default router;
