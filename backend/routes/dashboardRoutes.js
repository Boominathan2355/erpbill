/* backend/routes/dashboardRoutes.js */
import express from 'express';
import { getStats, getTrend } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', checkPermission('Dashboard', 'Read'), getStats);
router.get('/trend', checkPermission('Dashboard', 'Read'), getTrend);

export default router;
