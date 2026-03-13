import express from 'express';
import { getAllStaff, updateUserAccess, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin-only access for user/role management
router.use(protect);
router.use(authorize('admin'));

router.get('/staff', getAllStaff);
router.patch('/:id/access', updateUserAccess);
router.delete('/:id', deleteUser);

export default router;
