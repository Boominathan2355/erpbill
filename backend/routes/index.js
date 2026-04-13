/* backend/routes/index.js */
import express from 'express';
import authRoutes from './authRoutes.js';
import businessRoutes from './businessRoutes.js';
import clientRoutes from './clientRoutes.js';
import productRoutes from './productRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';
import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/settings', settingsRoutes);

export default router;
