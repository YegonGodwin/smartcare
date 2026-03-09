import express from 'express';
import { body, param } from 'express-validator';
import {
    listDoctors,
    getDoctorById,
    createDoctor,
    onboardDoctor,
    updateDoctor,
    deleteDoctor
} from '../controllers/doctorController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const doctorValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('specialization').trim().notEmpty().withMessage('Specialization is required'),
    body('department').isMongoId().withMessage('Valid department is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required')
];

const onboardDoctorValidation = [
    ...doctorValidation,
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

router.use(protect);
router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), listDoctors);
router.post('/onboard', authorize('admin'), onboardDoctorValidation, validateRequest, onboardDoctor);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), param('id').isMongoId().withMessage('Invalid doctor id'), validateRequest, getDoctorById);
router.post('/', authorize('admin'), doctorValidation, validateRequest, createDoctor);
router.put('/:id', authorize('admin'), param('id').isMongoId().withMessage('Invalid doctor id'), doctorValidation, validateRequest, updateDoctor);
router.delete('/:id', authorize('admin'), param('id').isMongoId().withMessage('Invalid doctor id'), validateRequest, deleteDoctor);

export default router;
