/* backend/routes/settingsRoutes.js */
import express from 'express';
import { getSettings, updateProfile, updateTax } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/rbacMiddleware.js';
import { auditLogger } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', checkPermission('Settings', 'Read'), getSettings);
router.put('/profile', checkPermission('Settings', 'Full'), auditLogger('Settings'), updateProfile);
router.put('/tax', checkPermission('Settings', 'Full'), auditLogger('Settings'), updateTax);

export default router;
