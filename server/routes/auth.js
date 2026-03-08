import express from 'express';
import { body } from 'express-validator';
import { bootstrapAdmin, login, registerUser, registerPatient, getCurrentUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

const baseUserValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

router.post('/bootstrap-admin', baseUserValidation, validateRequest, bootstrapAdmin);
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], validateRequest, login);
router.post('/patient-register', [
    ...baseUserValidation,
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('emergencyContact.name').trim().notEmpty().withMessage('Emergency contact name is required'),
    body('emergencyContact.relationship').trim().notEmpty().withMessage('Emergency contact relationship is required'),
    body('emergencyContact.phone').trim().notEmpty().withMessage('Emergency contact phone is required')
], validateRequest, registerPatient);
router.get('/me', protect, getCurrentUser);
router.post('/register', [
    ...baseUserValidation,
    body('role').isIn(['admin', 'doctor', 'receptionist', 'patient']).withMessage('Valid role is required'),
    body('department').optional({ values: 'falsy' }).isMongoId().withMessage('Department must be a valid id'),
    body('doctorProfile').optional({ values: 'falsy' }).isMongoId().withMessage('Doctor profile must be a valid id'),
    body('patientProfile').optional({ values: 'falsy' }).isMongoId().withMessage('Patient profile must be a valid id')
], validateRequest, protect, authorize('admin'), registerUser);

export default router;
