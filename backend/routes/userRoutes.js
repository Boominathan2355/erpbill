/* backend/routes/userRoutes.js */
import express from 'express';
import { getAll, create, update, deleteUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';
import { auditLogger } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Role Management', 'Read'), getAll);
router.post('/', checkPermission('Role Management', 'Full'), auditLogger('User Management'), create);
router.put('/:id', checkPermission('Role Management', 'Full'), auditLogger('User Management'), update);
router.delete('/:id', checkPermission('Role Management', 'Full'), auditLogger('User Management'), deleteUser);

export default router;
