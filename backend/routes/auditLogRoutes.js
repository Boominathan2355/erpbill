/* backend/routes/auditLogRoutes.js */
import express from 'express';
import { getAll } from '../controllers/auditLogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Audit Logs', 'Read'), getAll);

export default router;
