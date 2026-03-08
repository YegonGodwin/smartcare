import express from 'express';
import { body, param } from 'express-validator';
import {
    listDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} from '../controllers/departmentController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const departmentValidation = [
    body('name').trim().notEmpty().withMessage('Department name is required'),
    body('code').trim().notEmpty().withMessage('Department code is required')
];

router.use(protect);
router.get('/', listDepartments);
router.get('/:id', param('id').isMongoId().withMessage('Invalid department id'), validateRequest, getDepartmentById);
router.post('/', authorize('admin'), departmentValidation, validateRequest, createDepartment);
router.put('/:id', authorize('admin'), param('id').isMongoId().withMessage('Invalid department id'), departmentValidation, validateRequest, updateDepartment);
router.delete('/:id', authorize('admin'), param('id').isMongoId().withMessage('Invalid department id'), validateRequest, deleteDepartment);

export default router;
