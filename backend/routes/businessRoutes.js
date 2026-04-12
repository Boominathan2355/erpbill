/* backend/routes/businessRoutes.js */
import express from 'express';
import { getAll, create, getById, update, deleteBusiness } from '../controllers/businessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', deleteBusiness);

export default router;
