import express from 'express';
import { body, param } from 'express-validator';
import {
    listAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment
} from '../controllers/appointmentController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const appointmentValidation = [
    body('patient').isMongoId().withMessage('Valid patient is required'),
    body('doctor').isMongoId().withMessage('Valid doctor is required'),
    body('department').isMongoId().withMessage('Valid department is required'),
    body('scheduledFor').isISO8601().withMessage('Valid appointment date is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required')
];

router.use(protect);
router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), listAppointments);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), param('id').isMongoId().withMessage('Invalid appointment id'), validateRequest, getAppointmentById);
router.post('/', authorize('admin', 'doctor', 'receptionist'), appointmentValidation, validateRequest, createAppointment);
router.put('/:id', authorize('admin', 'doctor', 'receptionist'), param('id').isMongoId().withMessage('Invalid appointment id'), appointmentValidation, validateRequest, updateAppointment);
router.delete('/:id', authorize('admin', 'receptionist'), param('id').isMongoId().withMessage('Invalid appointment id'), validateRequest, deleteAppointment);

export default router;
