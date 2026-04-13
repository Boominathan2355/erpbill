/* backend/routes/productRoutes.js */
import express from 'express';
import { getAll, create, getById, update, deleteProduct } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';
import { auditLogger } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Products', 'Read'), getAll);
router.post('/', checkPermission('Products', 'Full'), auditLogger('Products'), create);
router.get('/:id', checkPermission('Products', 'Read'), getById);
router.put('/:id', checkPermission('Products', 'Full'), auditLogger('Products'), update);
router.delete('/:id', checkPermission('Products', 'Full'), auditLogger('Products'), deleteProduct);

export default router;
