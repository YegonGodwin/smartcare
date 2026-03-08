import express from 'express';
import { body, param } from 'express-validator';
import {
    listPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
} from '../controllers/patientController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const patientValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('emergencyContact.name').trim().notEmpty().withMessage('Emergency contact name is required'),
    body('emergencyContact.relationship').trim().notEmpty().withMessage('Emergency contact relationship is required'),
    body('emergencyContact.phone').trim().notEmpty().withMessage('Emergency contact phone is required'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email is required')
];

router.use(protect);
router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), listPatients);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), param('id').isMongoId().withMessage('Invalid patient id'), validateRequest, getPatientById);
router.post('/', authorize('admin', 'doctor', 'receptionist'), patientValidation, validateRequest, createPatient);
router.put('/:id', authorize('admin', 'doctor', 'receptionist'), param('id').isMongoId().withMessage('Invalid patient id'), patientValidation, validateRequest, updatePatient);
router.delete('/:id', authorize('admin'), param('id').isMongoId().withMessage('Invalid patient id'), validateRequest, deletePatient);

export default router;
