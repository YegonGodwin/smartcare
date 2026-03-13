import express from 'express';
import { getSystemLogs, getLogStats } from '../controllers/systemLogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/', getSystemLogs);
router.get('/stats', getLogStats);

export default router;
