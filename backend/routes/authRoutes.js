/* backend/routes/authRoutes.js */
import express from 'express';
import { register, login, logout, getProfile, refreshToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getProfile);
router.post('/logout', protect, logout);

export default router;
